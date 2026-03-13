<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Dto\SecurityRawReport;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileSecurityRawReportRepository implements SecurityRawReportRepositoryInterface {
    public function existingReportPaths(array $paths): array {
        $disk = Storage::disk($this->disk());
        $existingPaths = [];

        foreach ($this->jsonReportPaths($paths) as $path) {
            if (! $disk->exists($path)) {
                continue;
            }

            $existingPaths[] = $path;
        }

        return $existingPaths;
    }

    public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan {
        $metadata = [];

        foreach ($this->existingReportPaths($reportPaths) as $path) {
            $metadata[] = [
                'disk' => $this->disk(),
                'path' => $path,
                'filename' => basename($path),
            ];
        }

        $scan->updateOrFail([
            'raw_report_paths' => $metadata,
        ]);

        return $scan;
    }

    public function readReport(string $path): array {
        $content = Storage::disk($this->disk())->json($path);

        return is_array($content) ? $content : [];
    }

    public function reportsForScan(SecurityScan $scan): array {
        $reports = [];

        foreach ($scan->raw_report_paths ?? [] as $metadata) {
            if (! is_array($metadata) or ! isset($metadata['path'])) {
                continue;
            }

            $reports[] = new SecurityRawReport(
                disk: $metadata['disk'] ?? $this->disk(),
                path: $metadata['path'],
                filename: $metadata['filename'] ?? basename($metadata['path']),
                contents: $this->readReport($metadata['path']),
            );
        }

        return $reports;
    }

    private function disk(): string {
        return (string) config('trivy.reports.disk', 'trivy_reports');
    }

    private function directory(): string {
        return trim((string) config('trivy.reports.directory', 'trivy-reports'), '/');
    }

    private function jsonReportPaths(array $paths): array {
        $reportPaths = [];

        foreach ($paths as $path) {
            $path = ltrim(trim((string) $path), '/');

            if (empty($path) or ! Str::endsWith($path, '.json')) {
                continue;
            }

            if (! str_starts_with($path, $this->directory().'/')) {
                continue;
            }

            $reportPaths[] = $path;
        }

        return array_values(array_unique($reportPaths));
    }
}
