<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DueDiligenceTemplate extends Model {
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'created_by_id',
    ];

    protected function casts(): array {
        return [
            'is_active' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
