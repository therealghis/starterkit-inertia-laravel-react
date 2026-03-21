<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;

class ScanPackageManifestBuilder {
    public function build(SecurityScan $scan): array {
        return [
            'schema_version' => 1,
            'source' => [
                'key' => (string) config('trivy.publishing.source'),
                'app_name' => (string) config('app.name'),
            ],
            'scan' => $this->buildScanData($scan),
            'reports' => $this->buildReportList($scan),
        ];
    }

    private function buildScanData(SecurityScan $scan): array {
        return [
            'scan_key' => $scan->scan_key,
            'scan_date' => ($scan->finished_at ?? $scan->started_at)?->toDateString(),
            'scan_mode' => $scan->scan_mode,
            'status' => $scan->status->value,
            'started_at' => optional($scan->started_at)?->toIso8601String(),
            'finished_at' => optional($scan->finished_at)?->toIso8601String(),
        ];
    }

    private function buildReportList(SecurityScan $scan): array {
        $reportList = [];

        foreach ($scan->raw_report_paths ?? [] as $report) {
            if (! is_array($report) || ! isset($report['path'])) {
                continue;
            }

            $reportList[] = [
                'disk' => $report['disk'] ?? config('trivy.reports.disk'),
                'path' => $report['path'],
                'filename' => $report['filename'] ?? basename((string) $report['path']),
            ];
        }

        return $reportList;
    }
}
