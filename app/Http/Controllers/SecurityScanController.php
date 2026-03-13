<?php

namespace App\Http\Controllers;

use App\Models\Trivy\SecurityScan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityScanController extends Controller {
    public function index(Request $request): Response {
        $perPage = (int) $request->integer('perPage', 10);

        if ($perPage < 5) {
            $perPage = 5;
        }

        if ($perPage > 100) {
            $perPage = 100;
        }

        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $sort = (string) $request->query('sort', 'finished_at');
        $direction = strtolower((string) $request->query('direction', 'desc'));

        $allowedSorts = [
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

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'finished_at';
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $scans = SecurityScan::query()
            ->when(!empty($search), function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('scan_key', 'like', "%{$search}%")
                        ->orWhere('scan_mode', 'like', "%{$search}%");
                });
            })
            ->when(!empty($status), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderBy($sort, $direction)
            ->orderByDesc('id')
            ->paginate($perPage)
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

        return Inertia::render('security/scans/index', [
            'scans' => $scans,
            'table' => [
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                ],
                'sorting' => [
                    'column' => $sort,
                    'direction' => $direction,
                ],
                'pagination' => [
                    'page' => $scans->currentPage(),
                    'perPage' => $scans->perPage(),
                ],
            ],
        ]);
    }
}
