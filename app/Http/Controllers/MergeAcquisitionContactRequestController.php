<?php

namespace App\Http\Controllers;

use App\Http\Requests\MergeAcquisitionContactRequestStoreRequest;
use App\Mail\MergeAcquisitionContactRequestCreated;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class MergeAcquisitionContactRequestController extends Controller {
    public function store(MergeAcquisitionContactRequestStoreRequest $request, MergeAcquisition $mergeAcquisition): RedirectResponse {
        abort_unless($mergeAcquisition->active, 404);
        abort_if($request->user()->id === $mergeAcquisition->user_id, 403);

        $contactRequest = MergeAcquisitionContactRequest::query()->firstOrNew([
            'merge_acquisition_id' => $mergeAcquisition->id,
            'requester_email' => $request->user()->email,
        ]);

        $contactRequest->fill([
            'requester_name' => $request->validated('requester_name'),
            'requester_surname' => $request->validated('requester_surname'),
            'requester_email' => $request->user()->email,
            'requester_phone' => $request->validated('requester_phone'),
        ]);

        $wasRecentlyCreated = ! $contactRequest->exists;

        if ($contactRequest->isDirty()) {
            $contactRequest->save();
        }

        if ($wasRecentlyCreated) {
            $mergeAcquisition->loadMissing('user');

            Mail::to($mergeAcquisition->user->email)->send(
                new MergeAcquisitionContactRequestCreated(
                    mergeAcquisition: $mergeAcquisition,
                    requesterName: $contactRequest->requester_name,
                    requesterSurname: $contactRequest->requester_surname,
                    requesterEmail: $contactRequest->requester_email,
                    requesterPhone: $contactRequest->requester_phone,
                ),
            );
        }

        return back();
    }
}
