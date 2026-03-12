<?php

namespace App\Models\Trivy;

use Illuminate\Database\Eloquent\Model;

abstract class TrivyReportsModel extends Model {
    public function getConnectionName(): ?string {
        return config('trivy.database.connection');
    }
}
