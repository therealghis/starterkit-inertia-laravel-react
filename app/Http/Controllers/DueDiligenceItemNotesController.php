<?php

namespace App\Http\Controllers;

use App\Actions\DueDiligence\UpdateDueDiligenceItemNotes;
use App\Http\Requests\UpdateDueDiligenceItemNotesRequest;
use App\Models\DueDiligenceItem;
use Illuminate\Http\RedirectResponse;

class DueDiligenceItemNotesController extends Controller {
    public function update(
        UpdateDueDiligenceItemNotesRequest $request,
        DueDiligenceItem $dueDiligenceItem,
        UpdateDueDiligenceItemNotes $action
    ): RedirectResponse {
        $action->handle($dueDiligenceItem, $request->validated());

        return back(status: 303);
    }
}
