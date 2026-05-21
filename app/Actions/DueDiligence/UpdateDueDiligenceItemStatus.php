<?php

namespace App\Actions\DueDiligence;

use App\Enums\DueDiligenceItemStatus;
use App\Models\DueDiligenceItem;

class UpdateDueDiligenceItemStatus {
    public function handle(
        DueDiligenceItem $item,
        DueDiligenceItemStatus $status
    ): DueDiligenceItem {
        $item->status = $status;
        $item->save();

        return $item;
    }
}
