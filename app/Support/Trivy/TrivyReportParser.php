<?php

namespace App\Support\Trivy;

use App\Support\Trivy\Dto\SecurityRawReport;
use Illuminate\Support\Collection;

class TrivyReportParser {
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function parseReport(SecurityRawReport|array $report): Collection {
        $contents = $report instanceof SecurityRawReport ? $report->contents : $report;

        if (! is_array($contents)) {
            return collect();
        }

        $findings = collect();

        foreach ($contents['Results'] ?? [] as $result) {
            if (! is_array($result)) {
                continue;
            }

            foreach ($result['Vulnerabilities'] ?? [] as $finding) {
                if (! is_array($finding)) {
                    continue;
                }

                $primaryUrl = $this->stringValue($finding['PrimaryURL'] ?? null);

                if (is_null($primaryUrl)) {
                    foreach ($finding['References'] ?? [] as $reference) {
                        $primaryUrl = $this->stringValue($reference);

                        if (! is_null($primaryUrl)) {
                            break;
                        }
                    }
                }

                $extra = $finding;
                unset(
                    $extra['VulnerabilityID'],
                    $extra['Severity'],
                    $extra['Title'],
                    $extra['Description'],
                    $extra['PkgName'],
                    $extra['InstalledVersion'],
                    $extra['FixedVersion'],
                    $extra['PrimaryURL'],
                );

                $findings->push([
                    'target' => $this->stringValue($result['Target'] ?? null),
                    'class' => $this->stringValue($result['Class'] ?? null),
                    'type' => $this->stringValue($result['Type'] ?? null),
                    'vulnerability_id' => $this->stringValue($finding['VulnerabilityID'] ?? null),
                    'fingerprint' => $this->fingerprint(
                        vulnerabilityId: $this->stringValue($finding['VulnerabilityID'] ?? null),
                        packageName: $this->stringValue($finding['PkgName'] ?? null),
                        installedVersion: $this->stringValue($finding['InstalledVersion'] ?? null),
                        target: $this->stringValue($result['Target'] ?? null),
                        class: $this->stringValue($result['Class'] ?? null),
                        type: $this->stringValue($result['Type'] ?? null),
                    ),
                    'severity' => $this->severityValue($finding['Severity'] ?? null),
                    'title' => $this->stringValue($finding['Title'] ?? null),
                    'description' => $this->stringValue($finding['Description'] ?? null),
                    'package' => $this->stringValue($finding['PkgName'] ?? null),
                    'installed_version' => $this->stringValue($finding['InstalledVersion'] ?? null),
                    'fixed_version' => $this->stringValue($finding['FixedVersion'] ?? null),
                    'primary_url' => $primaryUrl,
                    'metadata' => [
                        'report' => $this->reportMetadata($report, $contents),
                        'finding' => $extra,
                    ],
                ]);
            }
        }

        return $findings->values();
    }

    private function severityValue(mixed $severity): ?string {
        $severity = $this->stringValue($severity);

        return is_null($severity) ? null : strtoupper($severity);
    }

    private function stringValue(mixed $value): ?string {
        $value = is_string($value) ? trim($value) : null;

        return $value === '' ? null : $value;
    }

    private function fingerprint(
        ?string $vulnerabilityId,
        ?string $packageName,
        ?string $installedVersion,
        ?string $target,
        ?string $class,
        ?string $type,
    ): string {
        return sha1(json_encode([
            'vulnerability_id' => $vulnerabilityId,
            'package_name' => $packageName,
            'installed_version' => $installedVersion,
            'target' => $target,
            'class' => $class,
            'type' => $type,
        ]));
    }

    /**
     * @param  SecurityRawReport|array<string, mixed>  $report
     * @param  array<string, mixed>  $contents
     * @return array<string, mixed>
     */
    private function reportMetadata(SecurityRawReport|array $report, array $contents): array {
        $metadata = [
            'report_id' => $this->stringValue($contents['ReportID'] ?? null),
            'artifact_name' => $this->stringValue($contents['ArtifactName'] ?? null),
            'artifact_type' => $this->stringValue($contents['ArtifactType'] ?? null),
            'created_at' => $this->stringValue($contents['CreatedAt'] ?? null),
            'report_metadata' => is_array($contents['Metadata'] ?? null) ? $contents['Metadata'] : null,
        ];

        if ($report instanceof SecurityRawReport) {
            $metadata['disk'] = $report->disk;
            $metadata['path'] = $report->path;
            $metadata['filename'] = $report->filename;
        }

        return $metadata;
    }
}
