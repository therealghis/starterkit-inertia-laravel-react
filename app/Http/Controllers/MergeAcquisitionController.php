<?php

namespace App\Http\Controllers;

use App\Enums\MergeAcquisitionType;
use App\Models\MergeAcquisition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MergeAcquisitionController extends Controller {
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response {
        $allowedTypes = [
            MergeAcquisitionType::BUY_SIDE,
            MergeAcquisitionType::SELL_SIDE,
        ];

        $activeType = $request->string('type')->toString();

        if (! in_array($activeType, $allowedTypes, true)) {
            $activeType = null;
        }

        return Inertia::render('merge_acquisition/index', [
            'activeType' => $activeType,
            'operationModes' => [
                [
                    'value' => MergeAcquisitionType::BUY_SIDE,
                    'label' => 'Buy-side',
                    'eyebrow' => 'Mandati di ricerca',
                    'description' => 'Opportunita riservate per investitori e operatori che stanno cercando target coerenti con una tesi di acquisizione.',
                    'ctaLabel' => 'Esplora buy-side',
                ],
                [
                    'value' => MergeAcquisitionType::SELL_SIDE,
                    'label' => 'Sell-side',
                    'eyebrow' => 'Mandati di cessione',
                    'description' => 'Deal attivi per aziende o asset in cessione, con focus su qualita del profilo e selettivita dei contatti.',
                    'ctaLabel' => 'Esplora sell-side',
                ],
            ],
            'summary' => [
                'activeOpportunities' => MergeAcquisition::query()->where('active', true)->count(),
                'buySideOpportunities' => MergeAcquisition::query()
                    ->where('active', true)
                    ->where('intent_type', MergeAcquisitionType::BUY_SIDE)
                    ->count(),
                'sellSideOpportunities' => MergeAcquisition::query()
                    ->where('active', true)
                    ->where('intent_type', MergeAcquisitionType::SELL_SIDE)
                    ->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(MergeAcquisition $mergeAcquisition) {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MergeAcquisition $mergeAcquisition) {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MergeAcquisition $mergeAcquisition) {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MergeAcquisition $mergeAcquisition) {
        //
    }
}
