<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MergeAcquisition extends Model {
    protected $table = 'merge_acquisition';
    protected $fillable = [
        'user_id',
        'merge_acquisition_economic_activity_id',
        'identification_code',
        'intent_type',
        'company_name',
        'company_description',
        'product',
        'legal_entity',
        'establishment_date',
        'ateco_code',
        'nominal_capital',
        'headquarters_legal_province',
        'headquarters_legal_country',
        'headquarters_operative_province',
        'headquarters_operative_country',
        'total_employees',
        'selling_type',
        'selling_reason',
        'real_estate',
        'active',
    ];

    protected function casts(): array {
        return [
            'real_estate' => 'boolean',
            'active' => 'boolean',
            'total_employees' => 'integer',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function economicActivity(): BelongsTo {
        return $this->belongsTo(MergeAcquisitionEconomicActivity::class, 'merge_acquisition_economic_activity_id');
    }

    public function audits(): HasMany {
        return $this->hasMany(MergeAcquisitionAudit::class);
    }

    public function attachments(): HasMany {
        return $this->hasMany(MergeAcquisitionAttachment::class);
    }

    public function financials(): HasMany {
        return $this->hasMany(MergeAcquisitionFinancial::class);
    }

    public function favoritePeople(): HasMany {
        return $this->hasMany(MergeAcquisitionFavoritePerson::class);
    }

    public function contactRequests(): HasMany {
        return $this->hasMany(MergeAcquisitionContactRequest::class);
    }
}
