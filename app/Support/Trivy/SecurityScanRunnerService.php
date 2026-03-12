<?php

namespace App\Support\Trivy;

use App\Support\Trivy\Dto\SecurityScanExecutionResult;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

class SecurityScanRunnerService {
    public function __construct(
        private SecurityRawReportRepositoryInterface $rawReportRepository,
    ) {
    }

    public function run(?string $scanMode = null): SecurityScanExecutionResult {
        $mode = $scanMode ?? $this->defaultScanMode();
        $existingReports = $this->rawReportRepository->discoverGeneratedReports();

        $startedAt = microtime(true);
        $result = Process::path(base_path())
            ->timeout(300)
            ->run($this->command($mode));
        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        $generatedReportPaths = $this->generatedReportPaths($existingReports);
        $failureReason = $this->failureReason($result, $generatedReportPaths);

        return new SecurityScanExecutionResult(
            scanMode: $mode,
            exitCode: $result->exitCode(),
            stdout: $result->output(),
            stderr: $result->errorOutput(),
            durationMs: $durationMs,
            generatedReportPaths: $generatedReportPaths,
            successful: $failureReason === null,
            failureReason: $failureReason,
        );
    }

    private function command(string $scanMode): array {
        return [
            'bash',
            $this->configuredCommand(),
            '--report-json',
            $scanMode,
        ];
    }

    private function generatedReportPaths(array $existingReports): array {
        $currentReports = $this->rawReportRepository->discoverGeneratedReports();
        return array_values(array_diff($currentReports, $existingReports));
    }

    private function failureReason(ProcessResult $result, array $generatedReportPaths): ?string {
        if ($result->failed()) {
            return 'Trivy command failed.';
        }

        if (empty($generatedReportPaths)) {
            return 'Trivy command completed without generating JSON reports.';
        }

        return null;
    }

    private function configuredCommand(): string {
        return trim((string) config('trivy.command', './docker/trivy/scan.sh'));
    }

    private function defaultScanMode(): string {
        return (string) config('trivy.scan.default_mode', 'all-without-dockerfiles');
    }
}
