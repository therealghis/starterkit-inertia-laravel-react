<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;

class FileSecurityRawReportRepository implements SecurityRawReportRepositoryInterface {
    public function __construct(
        private GeneratedReportDiscoveryService $generatedReportDiscoveryService,
    ) {
    }

    public function existingReportPaths(array $paths): array {
        return $this->generatedReportDiscoveryService->existingReportPaths($paths);
    }

    public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan {
        $scan->updateOrFail([
            'raw_report_paths' => $this->generatedReportDiscoveryService->reportMetadata($reportPaths),
        ]);

        return $scan;
    }
}
