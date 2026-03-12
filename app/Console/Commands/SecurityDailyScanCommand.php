<?php

namespace App\Console\Commands;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Enums\SecurityScanStatus;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
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
        SecurityRawReportRepositoryInterface $rawReportRepository,
    ): int {
        if (! config('trivy.enabled')) {
            $this->warn('Trivy daily scan is disabled by configuration.');

            return SymfonyCommand::SUCCESS;
        }

        $scan = SecurityScan::query()->create([
            'scan_key' => (string) Str::uuid(),
            'status' => SecurityScanStatus::Running,
            'scan_mode' => config('trivy.scan.default_mode'),
            'started_at' => Date::now(),
        ]);

        $result = $scanRunner->run($scan->scan_mode);

        if (! empty($result->generatedReportPaths)) {
            $rawReportRepository->storeReportPaths($scan, $result->generatedReportPaths);
        }

        if (! $result->successful) {
            $errorMessage = $result->failureReason;

            if ($errorMessage === null || $errorMessage == self::GENERIC_TRIVY_FAILURE_MESSAGE) {
                $errorMessage = trim($result->stderr) !== ''
                    ? trim($result->stderr)
                    : trim($result->stdout);
            }

            $scan->status = SecurityScanStatus::Failed;
            $scan->finished_at = Date::now();
            $scan->error_message = $errorMessage;
            $scan->save();

            Log::error('Security daily scan failed.', [
                'scan_id' => $scan->id,
                'scan_key' => $scan->scan_key,
                'scan_mode' => $scan->scan_mode,
                'exit_code' => $result->exitCode,
                'failure_reason' => $result->failureReason,
                'stderr' => $result->stderr,
            ]);

            $this->error('Security daily scan failed.');
            if ($errorMessage !== null && $errorMessage !== '') {
                $this->line($errorMessage);
            }

            return SymfonyCommand::FAILURE;
        }

        $scan->status = SecurityScanStatus::Completed;
        $scan->finished_at = Date::now();
        $scan->error_message = null;
        $scan->save();

        $this->info('Security daily scan completed.');

        return SymfonyCommand::SUCCESS;
    }
}
