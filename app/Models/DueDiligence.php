<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DueDiligence extends Model {
    use SoftDeletes;

    protected $fillable = [
        'merge_acquisition_id',
        'due_diligence_template_id',
        'title',
        'year',
        'status',
        'company_notes',
        'admin_notes',
        'created_by_id',
    ];

    protected function casts(): array {
        return [
            'year' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function mergeAcquisition(): BelongsTo {
        return $this->belongsTo(MergeAcquisition::class);
    }

    public function dueDiligenceTemplate(): BelongsTo {
        return $this->belongsTo(DueDiligenceTemplate::class);
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany {
        return $this->hasMany(DueDiligenceItem::class);
    }
}
