<?php

namespace App\Console\Commands;

use App\Models\Trivy\SecurityScan;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

class SecurityScanDeleteCommand extends Command {
    private const GENERIC_TRIVY_FAILURE_MESSAGE = 'Trivy command failed.';

    protected $signature = 'security:delete-scan';
    protected $description = 'Run the daily Trivy security scan and store its technical outcome.';

    public function handle(): int {
        if (! config('trivy.enabled')) {
            $this->warn('Trivy daily scan is disabled by configuration.');

            return SymfonyCommand::SUCCESS;
        }

        $scan = SecurityScan::query()->delete();

        return SymfonyCommand::SUCCESS;
    }
}
