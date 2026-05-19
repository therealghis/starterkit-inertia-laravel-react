<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MergeAcquisitionFinancial extends Model {
    protected $table = 'merge_acquisition_financial';
    protected $fillable = [
        'merge_acquisition_id',
        'year',
        'sales',
        'income',
        'pfn',
        'ebitda',
        'debt',
        'active',
    ];

    protected function casts(): array {
        return [
            'year' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function mergeAcquisition(): BelongsTo {
        return $this->belongsTo(MergeAcquisition::class);
    }
}
