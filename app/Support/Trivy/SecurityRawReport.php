<?php

namespace App\Support\Trivy;

readonly class SecurityRawReport {
    public function __construct(
        public string $disk,
        public string $path,
        public string $filename,
        public array $contents,
    ) {
    }
}
