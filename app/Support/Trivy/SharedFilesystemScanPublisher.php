<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityScan;
use RuntimeException;
use Illuminate\Support\Facades\Storage;

class SharedFilesystemScanPublisher {
    public function publish(SecurityScan $scan, array $manifest): array {
        $publishedReports = [];
        $packageDirectory = $this->packageDirectory($scan);
        $publishDisk = Storage::disk($this->publishDisk());

        if ($publishDisk->exists($packageDirectory)) {
            $publishDisk->deleteDirectory($packageDirectory);
        }

        foreach ($manifest['reports'] ?? [] as $report) {
            if (! is_array($report) || ! isset($report['path'])) {
                continue;
            }

            $sourceDisk = Storage::disk((string) ($report['disk'] ?? config('trivy.reports.disk', 'trivy_reports')));
            $sourcePath = (string) $report['path'];

            if (! $sourceDisk->exists($sourcePath)) {
                throw new RuntimeException("Raw report not found: {$sourcePath}");
            }

            $destinationPath = $packageDirectory.'/reports/'.($report['filename'] ?? basename($sourcePath));
            $publishDisk->put($destinationPath, $sourceDisk->get($sourcePath));

            $publishedReports[] = [
                'source_path' => $sourcePath,
                'published_path' => $destinationPath,
                'filename' => basename($destinationPath),
            ];
        }

        $manifest['reports'] = collect($manifest['reports'] ?? [])
            ->map(function (mixed $report) use ($publishedReports): mixed {
                if (! is_array($report) || ! isset($report['path'])) {
                    return $report;
                }

                $publishedReport = collect($publishedReports)
                    ->firstWhere('source_path', $report['path']);

                if (! is_array($publishedReport)) {
                    return $report;
                }

                $report['published_path'] = $publishedReport['published_path'];

                return $report;
            })
            ->values()
            ->all();

        $manifestPath = $packageDirectory.'/manifest.json';
        $publishDisk->put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));

        $scan->updateOrFail([
            'raw_report_paths' => $manifest['reports'],
        ]);

        return [
            'manifest_path' => $manifestPath,
            'reports' => $publishedReports,
        ];
    }

    private function publishDisk(): string {
        return (string) config('trivy.publishing.disk', config('trivy.reports.disk', 'trivy_reports'));
    }

    private function packageDirectory(SecurityScan $scan): string {
        $baseDirectory = trim((string) config('trivy.publishing.directory', 'trivy-packages'), '/');
        $source = trim((string) config('trivy.publishing.source', 'unknown-source'), '/');
        $scanDate = ($scan->finished_at ?? $scan->started_at)?->toDateString() ?? now()->toDateString();

        return "{$baseDirectory}/{$source}/{$scanDate}";
    }
}
