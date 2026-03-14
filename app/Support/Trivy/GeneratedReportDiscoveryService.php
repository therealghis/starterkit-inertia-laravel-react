<?php

namespace App\Support\Trivy;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GeneratedReportDiscoveryService {
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

    public function reportMetadata(array $paths): array {
        $metadata = [];

        foreach ($this->existingReportPaths($paths) as $path) {
            $metadata[] = [
                'disk' => $this->disk(),
                'path' => $path,
                'filename' => basename($path),
            ];
        }

        return $metadata;
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

            if ($path === '' || ! Str::endsWith($path, '.json')) {
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
