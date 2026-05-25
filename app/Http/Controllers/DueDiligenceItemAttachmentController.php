<?php

namespace App\Http\Controllers;

use App\Actions\DueDiligence\UploadDueDiligenceItemAttachment;
use App\Http\Requests\StoreDueDiligenceItemAttachmentRequest;
use App\Models\DueDiligenceItem;
use App\Models\DueDiligenceItemAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DueDiligenceItemAttachmentController extends Controller {
    public function store(
        StoreDueDiligenceItemAttachmentRequest $request,
        DueDiligenceItem $dueDiligenceItem,
        UploadDueDiligenceItemAttachment $action
    ): RedirectResponse {
        foreach ($request->file('attachments', []) as $attachment) {
            $action->handle($dueDiligenceItem, $attachment, $request->user());
        }

        return back(status: 303);
    }

    public function download(
        DueDiligenceItem $dueDiligenceItem,
        DueDiligenceItemAttachment $attachment
    ): StreamedResponse {
        abort_unless($attachment->due_diligence_item_id === $dueDiligenceItem->id, 404);
        abort_unless(Storage::disk($attachment->disk)->exists($attachment->file_path), 404);

        return Storage::disk($attachment->disk)->download(
            $attachment->file_path,
            $attachment->filename,
        );
    }

    public function destroy(
        DueDiligenceItem $dueDiligenceItem,
        DueDiligenceItemAttachment $attachment
    ): RedirectResponse {
        abort_unless($attachment->due_diligence_item_id === $dueDiligenceItem->id, 404);

        $attachment->delete();

        return back(status: 303);
    }
}
