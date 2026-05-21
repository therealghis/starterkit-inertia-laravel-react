<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MergeAcquisitionContactRequest extends Model {
    protected $table = 'merge_acquisition_contact_request';
    protected $fillable = [
        'merge_acquisition_id',
        'requester_name',
        'requester_surname',
        'requester_email',
        'requester_phone',
    ];

    public function mergeAcquisition(): BelongsTo {
        return $this->belongsTo(MergeAcquisition::class);
    }
}
