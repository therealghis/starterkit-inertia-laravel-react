<?php

namespace App\Models\Trivy;

use App\Support\Trivy\Enums\SecurityScanStatus;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $scan_key
 * @property SecurityScanStatus $status
 * @property string $scan_mode
 * @property \Carbon\CarbonImmutable|null $started_at
 * @property \Carbon\CarbonImmutable|null $finished_at
 * @property array<array-key, mixed>|null $raw_report_paths
 * @property int $critical_count
 * @property int $high_count
 * @property int $medium_count
 * @property int $low_count
 * @property int $unknown_count
 * @property int $new_count
 * @property int $fixed_count
 * @property string|null $error_message
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Trivy\SecurityFindingEvent> $events
 * @property-read int|null $events_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Trivy\SecurityFinding> $firstSeenFindings
 * @property-read int|null $first_seen_findings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Trivy\SecurityFinding> $lastSeenFindings
 * @property-read int|null $last_seen_findings_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereCriticalCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereErrorMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereFinishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereFixedCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereHighCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereLowCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereMediumCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereNewCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereRawReportPaths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereUnknownCount($value)
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
        'critical_count',
        'high_count',
        'medium_count',
        'low_count',
        'unknown_count',
        'new_count',
        'fixed_count',
        'error_message',
    ];

    protected function casts(): array {
        return [
            'status' => SecurityScanStatus::class,
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'raw_report_paths' => 'array',
            'critical_count' => 'integer',
            'high_count' => 'integer',
            'medium_count' => 'integer',
            'low_count' => 'integer',
            'unknown_count' => 'integer',
            'new_count' => 'integer',
            'fixed_count' => 'integer',
        ];
    }

    public function events(): HasMany {
        return $this->hasMany(SecurityFindingEvent::class);
    }

    public function firstSeenFindings(): HasMany {
        return $this->hasMany(SecurityFinding::class, 'first_seen_scan_id');
    }

    public function lastSeenFindings(): HasMany {
        return $this->hasMany(SecurityFinding::class, 'last_seen_scan_id');
    }
}
