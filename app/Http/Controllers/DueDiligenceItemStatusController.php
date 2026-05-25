<?php

namespace App\Http\Controllers;

use App\Actions\DueDiligence\UpdateDueDiligenceItemStatus;
use App\Enums\DueDiligenceItemStatus;
use App\Http\Requests\UpdateDueDiligenceItemStatusRequest;
use App\Models\DueDiligenceItem;
use Illuminate\Http\RedirectResponse;

class DueDiligenceItemStatusController extends Controller {
    public function update(
        UpdateDueDiligenceItemStatusRequest $request,
        DueDiligenceItem $dueDiligenceItem,
        UpdateDueDiligenceItemStatus $action
    ): RedirectResponse {
        $status = DueDiligenceItemStatus::from($request->validated('status'));

        $action->handle($dueDiligenceItem, $status);

        return back(status: 303);
    }
}
