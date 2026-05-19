<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MergeAcquisitionAudit extends Model {
    protected $table = 'merge_acquisition_audit';
    protected $fillable = [
        'merge_acquisition_id',
        'action',
        'audit_description',
    ];

    public function mergeAcquisition(): BelongsTo {
        return $this->belongsTo(MergeAcquisition::class);
    }
}
