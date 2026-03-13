<?php

namespace App\Console\Commands;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Dto\SecurityScanExecutionResult;
use App\Support\Trivy\Enums\SecurityScanStatus;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use App\Support\Trivy\SecurityFindingSyncService;
use App\Support\Trivy\SecurityScanRunnerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

class SecurityDailyScanCommand extends Command {
    private const GENERIC_TRIVY_FAILURE_MESSAGE = 'Trivy command failed.';

    protected $signature = 'security:daily-scan';
    protected $description = 'Run the daily Trivy security scan and store its technical outcome.';

    public function handle(
        SecurityScanRunnerService $scanRunner,
        SecurityFindingSyncService $findingSyncService,
        SecurityRawReportRepositoryInterface $rawReportRepository,
    ): int {
        if (! config('trivy.enabled')) {
            $this->warn('Trivy daily scan is disabled by configuration.');

            return SymfonyCommand::SUCCESS;
        }

        $scan = SecurityScan::create([
            'scan_key' => (string) Str::uuid(),
            'status' => SecurityScanStatus::Running,
            'scan_mode' => config('trivy.scan.default_mode'),
            'started_at' => Date::now(),
        ]);

        $result = $scanRunner->run($scan->scan_mode, $scan->scan_key);

        if (! empty($result->generatedReportPaths)) {
            $rawReportRepository->storeReportPaths($scan, $result->generatedReportPaths);
        }

        if ($result->successful) {
            $scan->fill([
                'status' => SecurityScanStatus::Completed,
                'finished_at' => Date::now(),
                'error_message' => null,
            ]);

            $delta = $findingSyncService->sync(
                $scan,
                $rawReportRepository->reportsForScan($scan),
            );

            $scan->updateOrFail([
                'status' => $scan->status,
                'finished_at' => $scan->finished_at,
                'error_message' => null,
                'critical_count' => $delta['summary']['critical_count'],
                'high_count' => $delta['summary']['high_count'],
                'medium_count' => $delta['summary']['medium_count'],
                'low_count' => $delta['summary']['low_count'],
                'unknown_count' => $delta['summary']['unknown_count'],
                'new_count' => $delta['summary']['new_count'],
                'fixed_count' => $delta['summary']['fixed_count'],
            ]);

            $this->info('Security daily scan completed.');

            return SymfonyCommand::SUCCESS;
        }

        $errorMessage = $this->errorMessage($result);

        $scan->updateOrFail([
            'status' => SecurityScanStatus::Failed,
            'finished_at' => Date::now(),
            'error_message' => $errorMessage,
        ]);

        Log::error('Security daily scan failed.', [
            'scan_id' => $scan->id,
            'scan_key' => $scan->scan_key,
            'scan_mode' => $scan->scan_mode,
            'exit_code' => $result->exitCode,
            'failure_reason' => $result->failureReason,
            'stderr' => $result->stderr,
        ]);

        $this->error('Security daily scan failed.');

        if ($errorMessage !== '') {
            $this->line($errorMessage);
        }

        return SymfonyCommand::FAILURE;
    }

    private function errorMessage(SecurityScanExecutionResult $result): string {
        if (!is_null($result->failureReason) and $result->failureReason != self::GENERIC_TRIVY_FAILURE_MESSAGE) {
            return $result->failureReason;
        }

        $errorOutput = trim($result->stderr);

        if ($errorOutput !== '') {
            return $errorOutput;
        }

        return trim($result->stdout);
    }
}
