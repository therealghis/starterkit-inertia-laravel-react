<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileSecurityRawReportRepository implements SecurityRawReportRepositoryInterface {
    public function discoverGeneratedReports(): array {
        $paths = [];

        foreach (Storage::disk($this->disk())->files($this->directory()) as $path) {
            if (! Str::endsWith($path, '.json')) {
                continue;
            }

            $paths[] = $path;
        }

        return $paths;
    }

    public function storeReportPaths(SecurityScan $scan, array $reportPaths): SecurityScan {
        $metadata = [];

        foreach ($reportPaths as $path) {
            $reportMetadata = $this->normalizeMetadata($path);

            if (is_null($reportMetadata)) {
                continue;
            }

            $metadata[] = $reportMetadata;
        }

        $scan->raw_report_paths = $metadata;
        $scan->save();

        return $scan;
    }

    public function readReport(string $path): array {
        $content = Storage::disk($this->disk())->json($this->normalizePath($path));

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

    private function normalizeMetadata(string $path): ?array {
        $normalizedPath = $this->normalizePath($path);

        if (empty($normalizedPath) or ! Storage::disk($this->disk())->exists($normalizedPath)) {
            return null;
        }

        return [
            'disk' => $this->disk(),
            'path' => $normalizedPath,
            'filename' => basename($normalizedPath),
        ];
    }

    private function normalizePath(string $path): string {
        $path = trim($path);

        if (empty($path)) {
            return '';
        }

        $storageRoot = storage_path('app').DIRECTORY_SEPARATOR;

        if (str_starts_with($path, $storageRoot)) {
            return ltrim(Str::after($path, $storageRoot), '/');
        }

        return ltrim($path, '/');
    }

    private function disk(): string {
        return (string) config('trivy.reports.disk', 'local');
    }

    private function directory(): string {
        return trim((string) config('trivy.reports.directory', 'trivy-reports'), '/');
    }
}
