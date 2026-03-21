<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class SharedFilesystemScanPublisher {
    public function publish(SecurityScan $scan, array $manifest): array {
        $destinationDirectory = $this->buildDestinationDirectory($scan);
        $destinationDisk = Storage::disk($this->destinationDiskName());

        $this->deleteExistingPackageDirectory($destinationDisk, $destinationDirectory);

        $reportsWithPublishedPaths = [];
        $publishedReports = [];

        foreach ($manifest['reports'] ?? [] as $report) {
            if (! is_array($report) || ! isset($report['path'])) {
                continue;
            }

            $publishedReport = $this->copyReportToPackageDirectory(
                destinationDisk: $destinationDisk,
                destinationDirectory: $destinationDirectory,
                report: $report,
            );

            $report['published_path'] = $publishedReport['published_path'];
            $reportsWithPublishedPaths[] = $report;
            $publishedReports[] = $publishedReport;
        }

        $manifest['reports'] = $reportsWithPublishedPaths;

        $manifestPath = $destinationDirectory.'/manifest.json';
        $destinationDisk->put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));

        $scan->updateOrFail([
            'raw_report_paths' => $manifest['reports'],
        ]);

        return [
            'manifest_path' => $manifestPath,
            'reports' => $publishedReports,
        ];
    }

    private function deleteExistingPackageDirectory($destinationDisk, string $destinationDirectory): void {
        if ($destinationDisk->exists($destinationDirectory)) {
            $destinationDisk->deleteDirectory($destinationDirectory);
        }
    }

    private function destinationDiskName(): string {
        return (string) config('trivy.publishing.disk', config('trivy.reports.disk', 'trivy_reports'));
    }

    private function copyReportToPackageDirectory($destinationDisk, string $destinationDirectory, array $report): array {
        $sourcePath = (string) $report['path'];
        $sourceDisk = Storage::disk($this->sourceDiskName($report));

        if (! $sourceDisk->exists($sourcePath)) {
            throw new RuntimeException("Raw report not found: {$sourcePath}");
        }

        $destinationPath = $destinationDirectory.'/reports/'.$this->resolveReportFilename($report, $sourcePath);

        $destinationDisk->put($destinationPath, $sourceDisk->get($sourcePath));

        return [
            'source_path' => $sourcePath,
            'published_path' => $destinationPath,
            'filename' => basename($destinationPath),
        ];
    }

    private function buildDestinationDirectory(SecurityScan $scan): string {
        $baseDirectory = trim((string) config('trivy.publishing.directory', 'trivy-packages'), '/');
        $source = trim((string) config('trivy.publishing.source', 'unknown-source'), '/');
        $scanDate = ($scan->finished_at ?? $scan->started_at)?->toDateString() ?? now()->toDateString();

        return "{$baseDirectory}/{$source}/{$scanDate}";
    }

    private function resolveReportFilename(array $report, string $sourcePath): string {
        return (string) ($report['filename'] ?? basename($sourcePath));
    }

    private function sourceDiskName(array $report): string {
        return (string) ($report['disk'] ?? config('trivy.reports.disk', 'trivy_reports'));
    }
}
