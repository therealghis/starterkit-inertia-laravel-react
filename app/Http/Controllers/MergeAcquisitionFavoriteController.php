<?php

namespace App\Http\Controllers;

use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionFavoritePerson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MergeAcquisitionFavoriteController extends Controller {
    public function store(Request $request, MergeAcquisition $mergeAcquisition): RedirectResponse {
        MergeAcquisitionFavoritePerson::query()->updateOrCreate(
            [
                'merge_acquisition_id' => $mergeAcquisition->id,
                'user_id' => $request->user()->id,
            ],
            [
                'active' => true,
            ],
        );

        return back();
    }

    public function destroy(Request $request, MergeAcquisition $mergeAcquisition): RedirectResponse {
        MergeAcquisitionFavoritePerson::query()
            ->where('merge_acquisition_id', $mergeAcquisition->id)
            ->where('user_id', $request->user()->id)
            ->update([
                'active' => false,
            ]);

        return back();
    }
}
