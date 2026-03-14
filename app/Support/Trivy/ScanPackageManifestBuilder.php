<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;

class ScanPackageManifestBuilder {
    public function build(SecurityScan $scan): array {
        $scanDate = ($scan->finished_at ?? $scan->started_at)?->toDateString();

        return [
            'schema_version' => 1,
            'source' => [
                'key' => (string) config('trivy.publishing.source'),
                'app_name' => (string) config('app.name'),
            ],
            'scan' => [
                'scan_key' => $scan->scan_key,
                'scan_date' => $scanDate,
                'scan_mode' => $scan->scan_mode,
                'status' => $scan->status->value,
                'started_at' => optional($scan->started_at)?->toIso8601String(),
                'finished_at' => optional($scan->finished_at)?->toIso8601String(),
            ],
            'reports' => collect($scan->raw_report_paths ?? [])
                ->filter(fn (mixed $report): bool => is_array($report) && isset($report['path']))
                ->map(fn (array $report): array => [
                    'disk' => $report['disk'] ?? config('trivy.reports.disk'),
                    'path' => $report['path'],
                    'filename' => $report['filename'] ?? basename((string) $report['path']),
                ])
                ->values()
                ->all(),
        ];
    }
}
