<?php

namespace App\Models\Trivy;

use App\Support\Trivy\Enums\SecurityFindingStatus;
use App\Support\Trivy\Enums\SecurityScanSeverity;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $fingerprint
 * @property string|null $vulnerability_id
 * @property string $pkg_name
 * @property string|null $installed_version
 * @property string|null $fixed_version
 * @property SecurityScanSeverity $severity
 * @property string|null $severity_source
 * @property string|null $title
 * @property string|null $primary_url
 * @property string|null $target
 * @property string|null $class
 * @property string|null $type
 * @property SecurityFindingStatus $status
 * @property \Carbon\CarbonImmutable|null $first_seen_at
 * @property \Carbon\CarbonImmutable|null $last_seen_at
 * @property int|null $first_seen_scan_id
 * @property int|null $last_seen_scan_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Trivy\SecurityFindingEvent> $events
 * @property-read int|null $events_count
 * @property-read \App\Models\Trivy\SecurityScan|null $firstSeenScan
 * @property-read \App\Models\Trivy\SecurityScan|null $lastSeenScan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereClass($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFirstSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFirstSeenScanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFixedVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereInstalledVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereLastSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereLastSeenScanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding wherePkgName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding wherePrimaryUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereSeveritySource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereVulnerabilityId($value)
 * @mixin \Eloquent
 */
class SecurityFinding extends TrivyReportsModel {
    protected $table = 'security_findings';
    protected $fillable = [
        'fingerprint',
        'vulnerability_id',
        'pkg_name',
        'installed_version',
        'fixed_version',
        'severity',
        'severity_source',
        'title',
        'primary_url',
        'target',
        'class',
        'type',
        'status',
        'first_seen_at',
        'last_seen_at',
        'first_seen_scan_id',
        'last_seen_scan_id',
    ];

    protected function casts(): array {
        return [
            'severity' => SecurityScanSeverity::class,
            'status' => SecurityFindingStatus::class,
            'first_seen_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'first_seen_scan_id' => 'integer',
            'last_seen_scan_id' => 'integer',
        ];
    }

    public function events(): HasMany {
        return $this->hasMany(SecurityFindingEvent::class);
    }

    public function firstSeenScan(): BelongsTo {
        return $this->belongsTo(SecurityScan::class, 'first_seen_scan_id');
    }

    public function lastSeenScan(): BelongsTo {
        return $this->belongsTo(SecurityScan::class, 'last_seen_scan_id');
    }
}
