<?php

namespace App\Models\Trivy;

use App\Support\Trivy\Enums\SecurityFindingEventType;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $security_finding_id
 * @property int $security_scan_id
 * @property SecurityFindingEventType $event_type
 * @property array<array-key, mixed>|null $payload
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property-read \App\Models\Trivy\SecurityFinding $finding
 * @property-read \App\Models\Trivy\SecurityScan $scan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereEventType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent wherePayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereSecurityFindingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereSecurityScanId($value)
 * @mixin \Eloquent
 */
class SecurityFindingEvent extends TrivyReportsModel {
    protected $table = 'security_finding_events';
    public $timestamps = false;
    protected $fillable = [
        'security_finding_id',
        'security_scan_id',
        'event_type',
        'payload',
        'created_at',
    ];

    protected function casts(): array {
        return [
            'security_finding_id' => 'integer',
            'security_scan_id' => 'integer',
            'event_type' => SecurityFindingEventType::class,
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function finding(): BelongsTo {
        return $this->belongsTo(SecurityFinding::class, 'security_finding_id');
    }

    public function scan(): BelongsTo {
        return $this->belongsTo(SecurityScan::class, 'security_scan_id');
    }
}
