<?php

namespace App\Actions\DueDiligence;

use App\Enums\DueDiligenceItemStatus;
use App\Models\DueDiligenceItem;
use App\Models\DueDiligenceItemAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class UploadDueDiligenceItemAttachment {
    public function handle(
        DueDiligenceItem $item,
        UploadedFile $file,
        ?User $uploadedBy = null
    ): DueDiligenceItemAttachment {
        $path = $file->store(
            "due-diligence/{$item->due_diligence_id}/items/{$item->id}/attachments",
            'local',
        );

        $attachment = DueDiligenceItemAttachment::query()->create([
            'due_diligence_item_id' => $item->id,
            'uploaded_by_id' => $uploadedBy?->id,
            'filename' => $file->getClientOriginalName(),
            'mimetype' => $file->getClientMimeType() ?: 'application/octet-stream',
            'file_path' => $path,
            'disk' => 'local',
            'size' => $file->getSize(),
        ]);

        if ($item->status === DueDiligenceItemStatus::OPEN->value) {
            $item->status = DueDiligenceItemStatus::IN_PROGRESS->value;
            $item->save();
        }

        return $attachment;
    }
}
