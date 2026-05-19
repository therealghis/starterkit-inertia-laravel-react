<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MergeAcquisitionAttachment extends Model {
    protected $table = 'merge_acquisition_attachment';
    protected $fillable = [
        'merge_acquisition_id',
        'mimetype',
        'file_path',
        'filename',
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
}
