<?php

namespace Tests\Feature;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Enums\SecurityScanStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityDailyScanCommandTest extends TestCase {
    use RefreshDatabase;

    public function test_daily_scan_command_publishes_the_raw_scan_package(): void {
        $this->configureTrivy();

        Process::fake([
            '*' => function ($process) {
                $prefixIndex = array_search('--report-prefix', $process->command, true);
                $reportPrefix = is_int($prefixIndex)
                    ? (string) ($process->command[$prefixIndex + 1] ?? 'scan')
                    : 'scan';

                Storage::disk('trivy_reports')->put(
                    "trivy-reports/{$reportPrefix}-fs.json",
                    json_encode([
                        'SchemaVersion' => 2,
                        'Results' => [],
                    ], JSON_THROW_ON_ERROR),
                );

                return Process::result(output: 'scan completed');
            },
        ]);

        $this->artisan('security:daily-scan')
            ->expectsOutput('Security daily scan completed.')
            ->assertSuccessful();

        $scan = $this->latestScan();
        $scanDate = ($scan->finished_at ?? $scan->started_at)?->toDateString();

        $this->assertSame(SecurityScanStatus::Completed, $scan->status);
        $this->assertNotNull($scan->finished_at);
        $this->assertCount(1, $scan->raw_report_paths ?? []);
        $this->assertSame(
            "trivy-reports/{$scan->scan_key}-fs.json",
            $scan->raw_report_paths[0]['path'],
        );
        $this->assertSame(
            "trivy-packages/test-source/{$scanDate}/reports/{$scan->scan_key}-fs.json",
            $scan->raw_report_paths[0]['published_path'],
        );

        Storage::disk('trivy_reports')->assertExists("trivy-reports/{$scan->scan_key}-fs.json");
        Storage::disk('trivy_reports')->assertExists("trivy-packages/test-source/{$scanDate}/manifest.json");
        Storage::disk('trivy_reports')->assertExists("trivy-packages/test-source/{$scanDate}/reports/{$scan->scan_key}-fs.json");

        Process::assertRanTimes(function ($process): bool {
            return in_array('--report-json', $process->command, true)
                && in_array('fs', $process->command, true);
        });
    }

    public function test_daily_scan_command_records_a_failed_technical_outcome(): void {
        $this->configureTrivy();

        Process::fake([
            '*' => Process::result(
                output: '',
                errorOutput: 'trivy exploded',
                exitCode: 1,
            ),
        ]);

        $this->artisan('security:daily-scan')
            ->expectsOutput('Security daily scan failed.')
            ->expectsOutput('trivy exploded')
            ->assertExitCode(1);

        $scan = $this->latestScan();

        $this->assertSame(SecurityScanStatus::Failed, $scan->status);
        $this->assertSame('trivy exploded', $scan->error_message);
        $this->assertNull($scan->raw_report_paths);
    }

    public function test_daily_scan_command_reuses_the_daily_package_directory(): void {
        $this->configureTrivy();

        Process::fake([
            '*' => function ($process) {
                $prefixIndex = array_search('--report-prefix', $process->command, true);
                $reportPrefix = is_int($prefixIndex)
                    ? (string) ($process->command[$prefixIndex + 1] ?? 'scan')
                    : 'scan';

                Storage::disk('trivy_reports')->put(
                    "trivy-reports/{$reportPrefix}-fs.json",
                    json_encode([
                        'SchemaVersion' => 2,
                        'Results' => [],
                    ], JSON_THROW_ON_ERROR),
                );

                return Process::result(output: 'scan completed');
            },
        ]);

        $this->artisan('security:daily-scan')->assertSuccessful();
        $firstScan = $this->latestScan();
        $scanDate = ($firstScan->finished_at ?? $firstScan->started_at)?->toDateString();

        $this->artisan('security:daily-scan')->assertSuccessful();
        $secondScan = $this->latestScan();

        Storage::disk('trivy_reports')->assertExists("trivy-packages/test-source/{$scanDate}/manifest.json");
        Storage::disk('trivy_reports')->assertMissing("trivy-packages/test-source/{$scanDate}/reports/{$firstScan->scan_key}-fs.json");
        Storage::disk('trivy_reports')->assertExists("trivy-packages/test-source/{$scanDate}/reports/{$secondScan->scan_key}-fs.json");
    }

    private function configureTrivy(): void {
        Storage::fake('trivy_reports');

        config([
            'trivy.enabled' => true,
            'trivy.command' => './docker/trivy/scan.sh',
            'trivy.scan.default_mode' => 'fs',
            'trivy.scan.alert_severities' => ['CRITICAL', 'HIGH'],
            'trivy.reports.disk' => 'trivy_reports',
            'trivy.reports.directory' => 'trivy-reports',
            'trivy.publishing.disk' => 'trivy_reports',
            'trivy.publishing.directory' => 'trivy-packages',
            'trivy.publishing.source' => 'test-source',
        ]);
    }

    private function latestScan(): SecurityScan {
        return SecurityScan::query()->latest('id')->firstOrFail();
    }
}
