<?php

namespace App\Http\Controllers;

use App\Models\Trivy\SecurityFinding;
use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Enums\SecurityFindingStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityScanController extends Controller {
    public function index(Request $request): Response {
        $tab = (string) $request->query('tab', 'scans');

        if (! in_array($tab, ['scans', 'open-findings'], true)) {
            $tab = 'scans';
        }

        $scansPerPage = $this->perPage($request->integer('scansPerPage', 10));
        $findingsPerPage = $this->perPage($request->integer('findingsPerPage', 10));

        $scansSearch = trim((string) $request->query('scansSearch', ''));
        $scansStatus = trim((string) $request->query('scansStatus', ''));
        $scansSort = (string) $request->query('scansSort', 'finished_at');
        $scansDirection = $this->direction((string) $request->query('scansDirection', 'desc'));

        $allowedScanSorts = [
            'finished_at',
            'status',
            'critical_count',
            'high_count',
            'medium_count',
            'low_count',
            'unknown_count',
            'new_count',
            'fixed_count',
        ];

        if (! in_array($scansSort, $allowedScanSorts, true)) {
            $scansSort = 'finished_at';
        }

        $findingsSeverity = trim((string) $request->query('findingsSeverity', ''));
        $findingsTarget = trim((string) $request->query('findingsTarget', ''));
        $findingsVulnerabilityId = trim((string) $request->query('findingsVulnerabilityId', ''));
        $findingsSort = (string) $request->query('findingsSort', 'last_seen_at');
        $findingsDirection = $this->direction((string) $request->query('findingsDirection', 'desc'));

        $allowedFindingSorts = [
            'vulnerability_id',
            'pkg_name',
            'installed_version',
            'severity',
            'first_seen_at',
            'last_seen_at',
        ];

        if (! in_array($findingsSort, $allowedFindingSorts, true)) {
            $findingsSort = 'last_seen_at';
        }

        $scans = SecurityScan::query()
            ->when(! empty($scansSearch), function ($query) use ($scansSearch) {
                $query->where(function ($query) use ($scansSearch) {
                    $query
                        ->where('scan_key', 'like', "%{$scansSearch}%")
                        ->orWhere('scan_mode', 'like', "%{$scansSearch}%");
                });
            })
            ->when(! empty($scansStatus), function ($query) use ($scansStatus) {
                $query->where('status', $scansStatus);
            })
            ->orderBy($scansSort, $scansDirection)
            ->orderByDesc('id')
            ->paginate($scansPerPage, ['*'], 'scansPage')
            ->withQueryString()
            ->through(function (SecurityScan $scan): array {
                return [
                    'id' => $scan->id,
                    'scan_key' => $scan->scan_key,
                    'scan_mode' => $scan->scan_mode,
                    'status' => $scan->status->value,
                    'date' => optional($scan->finished_at ?? $scan->started_at)?->toIso8601String(),
                    'severity_counts' => [
                        'critical' => $scan->critical_count,
                        'high' => $scan->high_count,
                        'medium' => $scan->medium_count,
                        'low' => $scan->low_count,
                        'unknown' => $scan->unknown_count,
                    ],
                    'new_count' => $scan->new_count,
                    'fixed_count' => $scan->fixed_count,
                    'raw_reports' => collect($scan->raw_report_paths ?? [])
                        ->filter(fn (mixed $report): bool => is_array($report))
                        ->map(fn (array $report): array => [
                            'filename' => $report['filename'] ?? basename((string) ($report['path'] ?? '')),
                            'path' => $report['path'] ?? null,
                        ])
                        ->values()
                        ->all(),
                ];
            });

        $openFindings = SecurityFinding::query()
            ->where('status', SecurityFindingStatus::Open->value)
            ->when(! empty($findingsSeverity), function ($query) use ($findingsSeverity) {
                $query->where('severity', $findingsSeverity);
            })
            ->when(! empty($findingsTarget), function ($query) use ($findingsTarget) {
                $query->where('target', 'like', "%{$findingsTarget}%");
            })
            ->when(! empty($findingsVulnerabilityId), function ($query) use ($findingsVulnerabilityId) {
                $query->where('vulnerability_id', 'like', "%{$findingsVulnerabilityId}%");
            })
            ->orderBy($findingsSort, $findingsDirection)
            ->orderByDesc('id')
            ->paginate($findingsPerPage, ['*'], 'findingsPage')
            ->withQueryString()
            ->through(function (SecurityFinding $finding): array {
                return [
                    'id' => $finding->id,
                    'vulnerability_id' => $finding->vulnerability_id,
                    'package' => $finding->pkg_name,
                    'installed_version' => $finding->installed_version,
                    'severity' => $finding->severity->value,
                    'target' => $finding->target,
                    'first_seen_at' => optional($finding->first_seen_at)?->toIso8601String(),
                    'last_seen_at' => optional($finding->last_seen_at)?->toIso8601String(),
                ];
            });

        return Inertia::render('security/scans/index', [
            'activeTab' => $tab,
            'scans' => $scans,
            'scansTable' => [
                'filters' => [
                    'search' => $scansSearch,
                    'status' => $scansStatus,
                ],
                'sorting' => [
                    'column' => $scansSort,
                    'direction' => $scansDirection,
                ],
                'pagination' => [
                    'page' => $scans->currentPage(),
                    'perPage' => $scans->perPage(),
                ],
            ],
            'openFindings' => $openFindings,
            'openFindingsTable' => [
                'filters' => [
                    'severity' => $findingsSeverity,
                    'target' => $findingsTarget,
                    'vulnerability_id' => $findingsVulnerabilityId,
                ],
                'sorting' => [
                    'column' => $findingsSort,
                    'direction' => $findingsDirection,
                ],
                'pagination' => [
                    'page' => $openFindings->currentPage(),
                    'perPage' => $openFindings->perPage(),
                ],
            ],
        ]);
    }

    private function perPage(int $perPage): int {
        if ($perPage < 5) {
            return 5;
        }

        if ($perPage > 100) {
            return 100;
        }

        return $perPage;
    }

    private function direction(string $direction): string {
        return in_array(strtolower($direction), ['asc', 'desc'], true) ? strtolower($direction) : 'desc';
    }
}
