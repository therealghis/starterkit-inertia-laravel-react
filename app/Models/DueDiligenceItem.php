<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DueDiligenceItem extends Model {
    use SoftDeletes;

    protected $fillable = [
        'due_diligence_id',
        'due_diligence_template_item_id',
        'entity',
        'topic',
        'request_text',
        'status',
        'company_notes',
        'admin_notes',
        'is_custom',
        'sort_order',
        'created_by_id',
    ];

    protected function casts(): array {
        return [
            'is_custom' => 'boolean',
            'sort_order' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function dueDiligence(): BelongsTo {
        return $this->belongsTo(DueDiligence::class);
    }

    public function dueDiligenceTemplateItem(): BelongsTo {
        return $this->belongsTo(DueDiligenceTemplateItem::class);
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function attachments(): HasMany {
        return $this->hasMany(DueDiligenceItemAttachment::class);
    }
}
