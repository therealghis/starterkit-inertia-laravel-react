<?php

namespace Tests\Unit;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use App\Support\Trivy\SecurityScanRunnerService;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class SecurityScanRunnerServiceTest extends TestCase {
    public function test_it_runs_trivy_with_a_deterministic_report_prefix_and_detects_expected_reports(): void {
        config()->set('trivy.command', './docker/trivy/scan.sh');
        config()->set('trivy.scan.default_mode', 'all-without-dockerfiles');

        Process::fake([
            '*' => Process::result(
                output: 'scan completed',
                errorOutput: '',
                exitCode: 0,
            ),
        ]);

        $repository = new class () implements SecurityRawReportRepositoryInterface {
            public function discoverGeneratedReports(): array {
                return [];
            }

            public function existingReportPaths(array $paths): array {
                return $paths;
            }

            public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan {
                return $scan;
            }

            public function readReport(string $path): array {
                return [];
            }

            public function reportsForScan(SecurityScan $scan): array {
                return [];
            }
        };

        $service = new SecurityScanRunnerService($repository);
        $result = $service->run('all-without-dockerfiles', 'scan-key-123');

        Process::assertRan(function (object $process) {
            return $process->command == [
                'bash',
                './docker/trivy/scan.sh',
                '--report-json',
                '--report-prefix',
                'scan-key-123',
                'all-without-dockerfiles',
            ];
        });

        $this->assertTrue($result->successful);
        $this->assertSame(0, $result->exitCode);
        $this->assertSame('all-without-dockerfiles', $result->scanMode);
        $this->assertSame([
            'trivy-reports/scan-key-123-all-without-dockerfiles-fs.json',
            'trivy-reports/scan-key-123-all-without-dockerfiles-config.json',
        ], $result->generatedReportPaths);
        $this->assertSame("scan completed\n", $result->stdout);
        $this->assertSame('', $result->stderr);
        $this->assertNull($result->failureReason);
    }

    public function test_it_fails_when_the_expected_reports_are_missing(): void {
        Process::fake([
            '*' => Process::result(
                output: 'scan completed',
                errorOutput: '',
                exitCode: 0,
            ),
        ]);

        $repository = new class () implements SecurityRawReportRepositoryInterface {
            public function discoverGeneratedReports(): array {
                return [];
            }

            public function existingReportPaths(array $paths): array {
                return [];
            }

            public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan {
                return $scan;
            }

            public function readReport(string $path): array {
                return [];
            }

            public function reportsForScan(SecurityScan $scan): array {
                return [];
            }
        };

        $result = (new SecurityScanRunnerService($repository))->run('all-without-dockerfiles', 'scan-key-123');

        $this->assertFalse($result->successful);
        $this->assertSame('Trivy command completed without generating JSON reports.', $result->failureReason);
    }
}
