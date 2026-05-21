<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DueDiligenceTemplateItem extends Model {
    use SoftDeletes;

    protected $fillable = [
        'due_diligence_template_id',
        'entity',
        'topic',
        'request_text',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function dueDiligenceTemplate(): BelongsTo {
        return $this->belongsTo(DueDiligenceTemplate::class);
    }

    public function dueDiligenceItems(): HasMany {
        return $this->hasMany(DueDiligenceItem::class);
    }
}
