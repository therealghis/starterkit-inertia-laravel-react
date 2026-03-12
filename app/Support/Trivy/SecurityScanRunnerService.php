<?php

namespace App\Support\Trivy;

use App\Support\Trivy\Dto\SecurityScanExecutionResult;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class SecurityScanRunnerService {
    public function __construct(
        private SecurityRawReportRepositoryInterface $rawReportRepository,
    ) {
    }

    public function run(?string $scanMode = null, ?string $reportPrefix = null): SecurityScanExecutionResult {
        $mode = $scanMode ?? $this->defaultScanMode();
        $reportPrefix ??= (string) Str::uuid();

        $startedAt = microtime(true);
        $result = Process::path(base_path())
            ->timeout(300)
            ->run($this->command($mode, $reportPrefix));
        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        $generatedReportPaths = $this->rawReportRepository->existingReportPaths(
            $this->expectedReportPaths($mode, $reportPrefix),
        );
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

    private function command(string $scanMode, string $reportPrefix): array {
        return [
            'bash',
            $this->configuredCommand(),
            '--report-json',
            '--report-prefix',
            $reportPrefix,
            $scanMode,
        ];
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

    private function expectedReportPaths(string $scanMode, string $reportPrefix): array {
        $directory = trim((string) config('trivy.reports.directory', 'trivy-reports'), '/');

        return match ($scanMode) {
            'fs' => ["{$directory}/{$reportPrefix}-fs.json"],
            'config' => ["{$directory}/{$reportPrefix}-config.json"],
            'all', 'all-with-dockerfiles' => [
                "{$directory}/{$reportPrefix}-all-with-dockerfiles-fs.json",
                "{$directory}/{$reportPrefix}-all-with-dockerfiles-config.json",
            ],
            'all-without-dockerfiles' => [
                "{$directory}/{$reportPrefix}-all-without-dockerfiles-fs.json",
                "{$directory}/{$reportPrefix}-all-without-dockerfiles-config.json",
            ],
            default => [],
        };
    }
}
