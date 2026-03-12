<?php

namespace App\Support\Trivy\Dto;

readonly class SecurityScanExecutionResult {
    public function __construct(
        public string $scanMode,
        public int $exitCode,
        public string $stdout,
        public string $stderr,
        public int $durationMs,
        public array $generatedReportPaths,
        public bool $successful,
        public ?string $failureReason = null,
    ) {
    }
}
