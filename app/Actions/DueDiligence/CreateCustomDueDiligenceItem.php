<?php

namespace App\Actions\DueDiligence;

use App\Enums\DueDiligenceItemStatus;
use App\Models\DueDiligence;
use App\Models\DueDiligenceItem;
use App\Models\User;

class CreateCustomDueDiligenceItem {
    public function handle(
        DueDiligence $dueDiligence,
        array $data,
        ?User $createdBy = null
    ): DueDiligenceItem {
        $currentMaxSortOrder = $dueDiligence->items()->max('sort_order') ?? 0;

        return DueDiligenceItem::query()->create([
            'due_diligence_id' => $dueDiligence->id,
            'due_diligence_template_item_id' => null,
            'entity' => $data['entity'],
            'topic' => $data['topic'],
            'request_text' => $data['request_text'],
            'status' => DueDiligenceItemStatus::OPEN,
            'company_notes' => $data['company_notes'] ?? null,
            'admin_notes' => $data['admin_notes'] ?? null,
            'is_custom' => true,
            'sort_order' => $currentMaxSortOrder + 10,
            'created_by_id' => $createdBy?->id,
        ]);
    }
}
