<?php

namespace Tests\Unit;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use App\Support\Trivy\SecurityScanRunnerService;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class SecurityScanRunnerServiceTest extends TestCase {
    public function test_it_runs_trivy_with_default_configuration_and_detects_generated_reports(): void {
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
            private int $calls = 0;

            public function discoverGeneratedReports(): array {
                $this->calls++;

                if ($this->calls === 1) {
                    return ['trivy-reports/old.json'];
                }

                return [
                    'trivy-reports/old.json',
                    'trivy-reports/new-fs.json',
                    'trivy-reports/new-config.json',
                ];
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
        $result = $service->run();

        Process::assertRan(function (object $process) {
            return $process->command == [
                'bash',
                './docker/trivy/scan.sh',
                '--report-json',
                'all-without-dockerfiles',
            ];
        });

        $this->assertTrue($result->successful);
        $this->assertSame(0, $result->exitCode);
        $this->assertSame('all-without-dockerfiles', $result->scanMode);
        $this->assertEqualsCanonicalizing([
            'trivy-reports/new-config.json',
            'trivy-reports/new-fs.json',
        ], $result->generatedReportPaths);
        $this->assertSame("scan completed\n", $result->stdout);
        $this->assertSame('', $result->stderr);
        $this->assertNull($result->failureReason);
    }

    public function test_it_fails_when_the_command_completes_without_reports(): void {
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

        $result = (new SecurityScanRunnerService($repository))->run('all-without-dockerfiles');

        $this->assertFalse($result->successful);
        $this->assertSame('Trivy command completed without generating JSON reports.', $result->failureReason);
    }
}
