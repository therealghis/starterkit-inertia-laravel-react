<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MergeAcquisitionEconomicActivity extends Model {
    protected $table = 'merge_acquisition_economic_activity';
    protected $fillable = [
        'activity_name',
        'active',
    ];

    protected function casts(): array {
        return [
            'active' => 'boolean',
        ];
    }

    public function mergeAcquisitions(): HasMany {
        return $this->hasMany(MergeAcquisition::class);
    }
}
