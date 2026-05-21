<?php

namespace App\Actions\DueDiligence;

use App\Models\DueDiligenceItem;

class UpdateDueDiligenceItemNotes {
    public function handle(
        DueDiligenceItem $item,
        array $data
    ): DueDiligenceItem {
        if (array_key_exists('company_notes', $data)) {
            $item->company_notes = $data['company_notes'];
        }

        if (array_key_exists('admin_notes', $data)) {
            $item->admin_notes = $data['admin_notes'];
        }

        $item->save();

        return $item;
    }
}
