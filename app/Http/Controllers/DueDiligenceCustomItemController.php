<?php

namespace App\Http\Controllers;

use App\Actions\DueDiligence\CreateCustomDueDiligenceItem;
use App\Http\Requests\StoreDueDiligenceCustomItemRequest;
use App\Models\DueDiligence;
use App\Models\DueDiligenceItem;
use Illuminate\Http\RedirectResponse;

class DueDiligenceCustomItemController extends Controller {
    public function store(
        StoreDueDiligenceCustomItemRequest $request,
        DueDiligence $dueDiligence,
        CreateCustomDueDiligenceItem $action
    ): RedirectResponse {
        $action->handle($dueDiligence, $request->validated());

        return back(status: 303);
    }

    public function destroy(DueDiligenceItem $dueDiligenceItem): RedirectResponse {
        if (!$dueDiligenceItem->is_custom) {
            abort(403);
        }

        $dueDiligenceItem->delete();
        $dueDiligenceItem->dueDiligence->refresh();

        return back(status: 303);
    }
}
