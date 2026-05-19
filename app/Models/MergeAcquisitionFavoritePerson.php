<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MergeAcquisitionFavoritePerson extends Model {
    protected $table = 'merge_acquisition_favorite_person';
    protected $fillable = [
        'merge_acquisition_id',
        'user_id',
        'active',
    ];

    protected function casts(): array {
        return [
            'active' => 'boolean',
        ];
    }

    public function mergeAcquisition(): BelongsTo {
        return $this->belongsTo(MergeAcquisition::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
