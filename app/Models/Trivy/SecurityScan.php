<?php

namespace App\Models\Trivy;

use App\Support\Trivy\Enums\SecurityScanStatus;

/**
 * @property int $id
 * @property string $scan_key
 * @property SecurityScanStatus $status
 * @property string $scan_mode
 * @property \Carbon\CarbonImmutable|null $started_at
 * @property \Carbon\CarbonImmutable|null $finished_at
 * @property array<array-key, mixed>|null $raw_report_paths
 * @property string|null $error_message
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereErrorMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereFinishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereRawReportPaths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class SecurityScan extends TrivyReportsModel {
    protected $table = 'security_scans';
    protected $fillable = [
        'scan_key',
        'status',
        'scan_mode',
        'started_at',
        'finished_at',
        'raw_report_paths',
        'error_message',
    ];

    protected function casts(): array {
        return [
            'status' => SecurityScanStatus::class,
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'raw_report_paths' => 'array',
        ];
    }
}
