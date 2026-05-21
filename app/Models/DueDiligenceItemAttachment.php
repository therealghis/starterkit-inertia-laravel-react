<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DueDiligenceItemAttachment extends Model {
    use SoftDeletes;

    protected $fillable = [
        'due_diligence_item_id',
        'uploaded_by_id',
        'filename',
        'mimetype',
        'file_path',
        'disk',
        'size',
    ];

    protected function casts(): array {
        return [
            'size' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function dueDiligenceItem(): BelongsTo {
        return $this->belongsTo(DueDiligenceItem::class);
    }

    public function uploadedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }
}
