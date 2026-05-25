<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDueDiligenceTemplateItemRequest;
use App\Http\Requests\UpdateDueDiligenceTemplateItemRequest;
use App\Models\DueDiligenceTemplate;
use App\Models\DueDiligenceTemplateItem;
use Illuminate\Http\RedirectResponse;

class DueDiligenceTemplateItemController extends Controller {
    public function store(
        StoreDueDiligenceTemplateItemRequest $request,
        DueDiligenceTemplate $dueDiligenceTemplate
    ): RedirectResponse {
        $validated = $request->validated();

        $sortOrder = $validated['sort_order']
            ?? (($dueDiligenceTemplate->items()->max('sort_order') ?? 0) + 10);

        $dueDiligenceTemplate->items()->create([
            'entity' => $validated['entity'],
            'topic' => $validated['topic'],
            'request_text' => $validated['request_text'],
            'sort_order' => $sortOrder,
            'is_active' => array_key_exists('is_active', $validated)
                ? $validated['is_active']
                : true,
        ]);

        return to_route('due_diligence_templates.edit', $dueDiligenceTemplate);
    }

    public function update(
        UpdateDueDiligenceTemplateItemRequest $request,
        DueDiligenceTemplateItem $item
    ): RedirectResponse {
        $validated = $request->validated();

        $item->update([
            'entity' => $validated['entity'],
            'topic' => $validated['topic'],
            'request_text' => $validated['request_text'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        return back();
    }

    public function destroy(DueDiligenceTemplateItem $item): RedirectResponse {
        $item->delete();

        return back();
    }
}
