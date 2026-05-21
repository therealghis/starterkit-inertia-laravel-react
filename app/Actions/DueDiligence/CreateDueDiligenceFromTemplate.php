<?php

namespace App\Actions\DueDiligence;

use App\Enums\DueDiligenceItemStatus;
use App\Models\DueDiligence;
use App\Models\DueDiligenceTemplate;
use App\Models\DueDiligenceTemplateItem;
use App\Models\MergeAcquisition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateDueDiligenceFromTemplate {
    public function handle(MergeAcquisition $mergeAcquisition, DueDiligenceTemplate $template, array $data, ?User $createdBy = null): DueDiligence {
        return DB::transaction(function () use ($mergeAcquisition, $template, $data, $createdBy): DueDiligence {
            $dueDiligence = DueDiligence::query()->create([
                'merge_acquisition_id' => $mergeAcquisition->id,
                'due_diligence_template_id' => $template->id,
                'title' => $data['title'],
                'year' => $data['year'] ?? null,
                'status' => $data['status'] ?? 'open',
                'company_notes' => $data['company_notes'] ?? null,
                'admin_notes' => $data['admin_notes'] ?? null,
                'created_by_id' => $createdBy?->id,
            ]);

            $templateItems = DueDiligenceTemplateItem::query()
                ->where('due_diligence_template_id', $template->id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

            $dueDiligence->items()->createMany(
                $templateItems
                    ->map(fn (DueDiligenceTemplateItem $templateItem): array => [
                        'due_diligence_template_item_id' => $templateItem->id,
                        'entity' => $templateItem->entity,
                        'topic' => $templateItem->topic,
                        'request_text' => $templateItem->request_text,
                        'status' => DueDiligenceItemStatus::OPEN,
                        'is_custom' => false,
                        'sort_order' => $templateItem->sort_order,
                        'created_by_id' => $createdBy?->id,
                    ])
                    ->all()
            );

            return $dueDiligence->load('items');
        });
    }
}
