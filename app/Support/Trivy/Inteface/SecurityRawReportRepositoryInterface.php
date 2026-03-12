<?php

namespace App\Support\Trivy\Inteface;

use App\Models\Trivy\SecurityScan;

interface SecurityRawReportRepositoryInterface {
    public function existingReportPaths(array $paths): array;

    public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan;

    public function readReport(string $path): array;

    public function reportsForScan(SecurityScan $scan): array;
}
