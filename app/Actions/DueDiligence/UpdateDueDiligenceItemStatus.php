<?php

namespace App\Actions\DueDiligence;

use App\Models\DueDiligenceItem;

class UpdateDueDiligenceItemStatus {
    public function handle(
        DueDiligenceItem $item,
        string $status
    ): DueDiligenceItem {
        $item->status = $status;
        $item->save();

        return $item;
    }
}
