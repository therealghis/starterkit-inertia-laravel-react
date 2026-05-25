<?php

namespace App\Http\Controllers;

use App\Actions\DueDiligence\CreateDueDiligenceFromTemplate;
use App\Enums\DueDiligenceItemStatus;
use App\Http\Requests\StoreDueDiligenceRequest;
use App\Models\DueDiligence;
use App\Models\DueDiligenceItem;
use App\Models\DueDiligenceItemAttachment;
use App\Models\DueDiligenceTemplate;
use App\Models\MergeAcquisition;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DueDiligenceController extends Controller {
    public function index(MergeAcquisition $mergeAcquisition): Response {
        $dueDiligences = DueDiligence::query()
            ->where('merge_acquisition_id', $mergeAcquisition->id)
            ->withCount('items')
            ->withCount([
                'items as completed_items_count' => fn ($query) => $query
                    ->where('status', DueDiligenceItemStatus::COMPLETED),
            ])
            ->orderByRaw('year IS NULL')
            ->orderByDesc('year')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('due_diligences/index', [
            'mergeAcquisition' => [
                'id' => $mergeAcquisition->id,
                'identification_code' => $mergeAcquisition->identification_code,
                'company_name' => $mergeAcquisition->company_name,
            ],
            'dueDiligences' => $dueDiligences
                ->map(fn (DueDiligence $dueDiligence): array => [
                    'id' => $dueDiligence->id,
                    'title' => $dueDiligence->title,
                    'year' => $dueDiligence->year,
                    'status' => $dueDiligence->status,
                    'items_count' => $dueDiligence->items_count,
                    'completed_items_count' => $dueDiligence->completed_items_count,
                    'created_at' => $dueDiligence->created_at,
                    'show_url' => route('due_diligences.show', $dueDiligence),
                ])
                ->values(),
        ]);
    }

    public function create(MergeAcquisition $mergeAcquisition): Response {
        $templates = DueDiligenceTemplate::query()
            ->where('is_active', true)
            ->withCount([
                'items as items_count' => fn ($query) => $query
                    ->where('is_active', true),
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('due_diligences/create', [
            'mergeAcquisition' => [
                'id' => $mergeAcquisition->id,
                'identification_code' => $mergeAcquisition->identification_code,
                'company_name' => $mergeAcquisition->company_name,
            ],
            'templates' => $templates
                ->map(fn (DueDiligenceTemplate $template): array => [
                    'label' => $template->name,
                    'value' => $template->id,
                    'items_count' => $template->items_count,
                ])
                ->values(),
        ]);
    }

    public function store(
        StoreDueDiligenceRequest $request,
        MergeAcquisition $mergeAcquisition,
        CreateDueDiligenceFromTemplate $action
    ): RedirectResponse {
        $validated = $request->validated();

        $template = DueDiligenceTemplate::query()
            ->whereKey($validated['due_diligence_template_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $dueDiligence = $action->handle(
            $mergeAcquisition,
            $template,
            $validated,
            $request->user(),
        );

        return to_route('due_diligences.show', $dueDiligence);
    }

    public function show(DueDiligence $dueDiligence): Response {
        $dueDiligence->load([
            'mergeAcquisition',
            'items' => fn ($query) => $query
                ->orderBy('sort_order')
                ->orderBy('id'),
            'items.attachments' => fn ($query) => $query
                ->orderByDesc('created_at'),
        ]);

        $items = $dueDiligence->items;
        $total = $items->count();
        $open = $items->where('status', DueDiligenceItemStatus::OPEN)->count();
        $inProgress = $items->where('status', DueDiligenceItemStatus::IN_PROGRESS)->count();
        $completed = $items->where('status', DueDiligenceItemStatus::COMPLETED)->count();
        $notApplicable = $items->where('status', DueDiligenceItemStatus::NOT_APPLICABLE)->count();
        $completionBase = $total - $notApplicable;

        return Inertia::render('due_diligences/show', [
            'dueDiligence' => [
                'id' => $dueDiligence->id,
                'title' => $dueDiligence->title,
                'year' => $dueDiligence->year,
                'status' => $dueDiligence->status,
                'company_notes' => $dueDiligence->company_notes,
                'admin_notes' => $dueDiligence->admin_notes,
                'created_at' => $dueDiligence->created_at,
            ],
            'mergeAcquisition' => [
                'id' => $dueDiligence->mergeAcquisition->id,
                'identification_code' => $dueDiligence->mergeAcquisition->identification_code,
                'company_name' => $dueDiligence->mergeAcquisition->company_name,
            ],
            'items' => $items
                ->map(fn (DueDiligenceItem $item): array => [
                    'id' => $item->id,
                    'due_diligence_template_item_id' => $item->due_diligence_template_item_id,
                    'entity' => $item->entity,
                    'topic' => $item->topic,
                    'request_text' => $item->request_text,
                    'status' => $item->status,
                    'company_notes' => $item->company_notes,
                    'admin_notes' => $item->admin_notes,
                    'is_custom' => $item->is_custom,
                    'sort_order' => $item->sort_order,
                    'attachments' => $item->attachments
                        ->map(fn (DueDiligenceItemAttachment $attachment): array => [
                            'id' => $attachment->id,
                            'filename' => $attachment->filename,
                            'mimetype' => $attachment->mimetype,
                            'file_path' => $attachment->file_path,
                            'disk' => $attachment->disk,
                            'size' => $attachment->size,
                            'created_at' => $attachment->created_at,
                        ])
                        ->values(),
                ])
                ->values(),
            'statuses' => collect(DueDiligenceItemStatus::values())
                ->map(fn (string $status): array => [
                    'value' => $status,
                    'label' => DueDiligenceItemStatus::label($status),
                ])
                ->values(),
            'summary' => [
                'total' => $total,
                'open' => $open,
                'in_progress' => $inProgress,
                'completed' => $completed,
                'not_applicable' => $notApplicable,
                'completion_percentage' => $completionBase > 0
                    ? round(($completed / $completionBase) * 100, 2)
                    : 0,
            ],
        ]);
    }

    public function destroy(DueDiligence $dueDiligence): RedirectResponse {
        $mergeAcquisition = $dueDiligence->mergeAcquisition;

        $dueDiligence->delete();

        return to_route('merge_acquisition.due_diligences.index', $mergeAcquisition);
    }
}
