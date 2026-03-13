<?php

$alertSeverities = env('TRIVY_ALERT_SEVERITIES', 'CRITICAL,HIGH');

if (is_string($alertSeverities)) {
    $alertSeverities = explode(',', $alertSeverities);
}

$alertSeverities = array_filter(
    array_map(
        static fn (mixed $severity): string => strtoupper(trim((string) $severity)),
        $alertSeverities,
    ),
    static fn (string $severity): bool => $severity !== '',
);

return [
    'enabled' => env('TRIVY_ENABLED', true),

    'command' => env('TRIVY_COMMAND', './docker/trivy/scan.sh'),

    'scan' => [
        'default_mode' => env('TRIVY_DEFAULT_SCAN_MODE', 'all-without-dockerfiles'),
        'alert_severities' => array_values($alertSeverities),
    ],

    'reports' => [
        'disk' => env('TRIVY_REPORTS_DISK', 'trivy_reports'),
        'directory' => env('TRIVY_REPORTS_DIRECTORY', 'trivy-reports'),
    ],

    'database' => [
        'connection' => env('TRIVY_REPORTS_DB_CONNECTION', 'trivy_reports'),
    ],
];
