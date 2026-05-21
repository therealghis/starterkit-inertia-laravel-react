<?php

namespace App\Http\Controllers;

use App\Http\Requests\MergeAcquisitionContactRequestStoreRequest;
use App\Mail\MergeAcquisitionContactRequestCreated;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class MergeAcquisitionContactRequestController extends Controller {
    public function store(MergeAcquisitionContactRequestStoreRequest $request, MergeAcquisition $mergeAcquisition): RedirectResponse {
        abort_unless($mergeAcquisition->active, 404);
        abort_if($request->user()->id === $mergeAcquisition->user_id, 403);

        $requesterEmail = $request->validated('requester_email');

        $contactRequestAlreadyExists = MergeAcquisitionContactRequest::query()
            ->where('merge_acquisition_id', $mergeAcquisition->id)
            ->where('requester_email', $requesterEmail)
            ->exists();

        if ($contactRequestAlreadyExists) {
            throw ValidationException::withMessages([
                'contact_request' => 'Hai già inviato una richiesta di contatto per questa opportunità.',
            ]);
        }

        $contactRequest = MergeAcquisitionContactRequest::query()->create([
            'merge_acquisition_id' => $mergeAcquisition->id,
            'requester_name' => $request->validated('requester_name'),
            'requester_surname' => $request->validated('requester_surname'),
            'requester_email' => $requesterEmail,
            'requester_phone' => $request->validated('requester_phone'),
        ]);

        $mergeAcquisition->loadMissing('user');

        Mail::to($mergeAcquisition->user->email)->queue(
            new MergeAcquisitionContactRequestCreated(
                mergeAcquisition: $mergeAcquisition,
                requesterName: $contactRequest->requester_name,
                requesterSurname: $contactRequest->requester_surname,
                requesterEmail: $contactRequest->requester_email,
                requesterPhone: $contactRequest->requester_phone,
            ),
        );

        return back();
    }
}
