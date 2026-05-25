<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDueDiligenceTemplateRequest;
use App\Http\Requests\UpdateDueDiligenceTemplateRequest;
use App\Models\DueDiligenceTemplate;
use App\Models\DueDiligenceTemplateItem;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DueDiligenceTemplateController extends Controller {
    public function index(): Response {
        $dueDiligenceTemplates = DueDiligenceTemplate::query()
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return Inertia::render('due_diligence_templates/index', [
            'templates' => $dueDiligenceTemplates
                ->map(fn (DueDiligenceTemplate $dueDiligenceTemplate): array => [
                    'id' => $dueDiligenceTemplate->id,
                    'name' => $dueDiligenceTemplate->name,
                    'description' => $dueDiligenceTemplate->description,
                    'is_active' => $dueDiligenceTemplate->is_active,
                    'items_count' => $dueDiligenceTemplate->items_count,
                    'edit_url' => route('due_diligence_templates.edit', $dueDiligenceTemplate),
                    'delete_url' => route('due_diligence_templates.destroy', $dueDiligenceTemplate),
                ])
                ->values(),
        ]);
    }

    public function create(): Response {
        return Inertia::render('due_diligence_templates/create');
    }

    public function store(StoreDueDiligenceTemplateRequest $request): RedirectResponse {
        $validated = $request->validated();

        $dueDiligenceTemplate = DueDiligenceTemplate::query()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => array_key_exists('is_active', $validated)
                ? $validated['is_active']
                : true,
            'created_by_id' => $request->user()->id,
        ]);

        return to_route('due_diligence_templates.edit', $dueDiligenceTemplate);
    }

    public function edit(DueDiligenceTemplate $dueDiligenceTemplate): Response {
        $dueDiligenceTemplate->load([
            'items' => fn ($query) => $query
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);

        return Inertia::render('due_diligence_templates/edit', [
            'dueDiligenceTemplate' => [
                'id' => $dueDiligenceTemplate->id,
                'name' => $dueDiligenceTemplate->name,
                'description' => $dueDiligenceTemplate->description,
                'is_active' => $dueDiligenceTemplate->is_active,
                'created_by_id' => $dueDiligenceTemplate->created_by_id,
                'created_at' => $dueDiligenceTemplate->created_at,
                'updated_at' => $dueDiligenceTemplate->updated_at,
            ],
            'items' => $dueDiligenceTemplate->items
                ->map(fn (DueDiligenceTemplateItem $item): array => [
                    'id' => $item->id,
                    'entity' => $item->entity,
                    'topic' => $item->topic,
                    'request_text' => $item->request_text,
                    'sort_order' => $item->sort_order,
                    'is_active' => $item->is_active,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ])
                ->values(),
        ]);
    }

    public function update(
        UpdateDueDiligenceTemplateRequest $request,
        DueDiligenceTemplate $dueDiligenceTemplate
    ): RedirectResponse {
        $validated = $request->validated();

        $dueDiligenceTemplate->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active'),
        ]);

        return back();
    }

    public function destroy(DueDiligenceTemplate $dueDiligenceTemplate): RedirectResponse {
        $dueDiligenceTemplate->delete();

        return to_route('due_diligence_templates.index');
    }
}
