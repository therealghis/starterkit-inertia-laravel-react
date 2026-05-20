<?php

namespace App\Http\Controllers;

use App\Enums\MergeAcquisitionType;
use App\Http\Requests\MergeAcquisitionRequest;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionEconomicActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MergeAcquisitionController extends Controller {
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response {
        return $this->renderListing($request, null);
    }

    public function buySide(Request $request): Response {
        return $this->renderListing(
            $request,
            MergeAcquisitionType::BUY_SIDE,
        );
    }

    public function sellSide(Request $request): Response {
        return $this->renderListing(
            $request,
            MergeAcquisitionType::SELL_SIDE,
        );
    }

    private function renderListing(Request $request, ?string $activeType): Response {
        $user = $request->user();
        $page = max($request->integer('page', 1), 1);
        $pageSize = $this->resolvePageSize($request->integer('page_size', 10));
        $sortColumn = $this->resolveSortColumn($request->string('sort')->toString());
        $sortDirection = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';

        $identificationCode = trim($request->string('identification_code')->toString());
        $economicActivityId = $request->integer('economic_activity_id');
        $legalEntity = trim($request->string('legal_entity')->toString());
        $activityDescription = trim($request->string('activity_description')->toString());
        $atecoCode = trim($request->string('ateco_code')->toString());
        $headquarters = trim($request->string('headquarters')->toString());
        $favorite = $this->resolveFavoriteFilter($request->string('favorite')->toString());

        $query = MergeAcquisition::query()
            ->where('active', true)
            ->with([
                'economicActivity:id,activity_name',
                'favoritePeople' => fn ($builder) => $builder
                    ->where('user_id', $user?->id)
                    ->where('active', true),
            ]);

        if ($identificationCode !== '') {
            $query->where('identification_code', 'like', "%{$identificationCode}%");
        }

        if ($activeType !== null) {
            $query->where('intent_type', $activeType);
        }

        if ($economicActivityId > 0) {
            $query->where('merge_acquisition_economic_activity_id', $economicActivityId);
        }

        if ($legalEntity !== '') {
            $query->where('legal_entity', 'like', "%{$legalEntity}%");
        }

        if ($activityDescription !== '') {
            $query->where('company_description', 'like', "%{$activityDescription}%");
        }

        if ($atecoCode !== '') {
            $query->where('ateco_code', 'like', "%{$atecoCode}%");
        }

        if ($headquarters !== '') {
            $query->where(function ($builder) use ($headquarters): void {
                $builder
                    ->where('headquarters_legal_province', 'like', "%{$headquarters}%")
                    ->orWhere('headquarters_legal_country', 'like', "%{$headquarters}%")
                    ->orWhere('headquarters_operative_province', 'like', "%{$headquarters}%")
                    ->orWhere('headquarters_operative_country', 'like', "%{$headquarters}%");
            });
        }

        if ($favorite !== null && $user !== null) {
            if ($favorite) {
                $query->whereHas('favoritePeople', fn ($builder) => $builder
                    ->where('user_id', $user->id)
                    ->where('active', true));
            } else {
                $query->whereDoesntHave('favoritePeople', fn ($builder) => $builder
                    ->where('user_id', $user->id)
                    ->where('active', true));
            }
        }

        $opportunities = (clone $query)
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($pageSize, ['*'], 'page', $page)
            ->withQueryString();

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
            'opportunities' => $opportunities->getCollection()->map(
                fn (MergeAcquisition $mergeAcquisition): array => [
                    'id' => $mergeAcquisition->id,
                    'opportunityCode' => $mergeAcquisition->identification_code,
                    'operationType' => $mergeAcquisition->intent_type,
                    'activitySector' => $mergeAcquisition->economicActivity?->activity_name ?? 'N/D',
                    'legalEntity' => $mergeAcquisition->legal_entity ?? 'N/D',
                    'activityDescription' => $mergeAcquisition->company_description ?? 'N/D',
                    'product' => $mergeAcquisition->product ?? 'N/D',
                    'atecoCode' => $mergeAcquisition->ateco_code ?? 'N/D',
                    'headquarters' => $this->formatHeadquarters($mergeAcquisition),
                    'favorite' => $mergeAcquisition->favoritePeople->isNotEmpty(),
                    'companyName' => $mergeAcquisition->company_name ?? 'N/D',
                    'companyDescription' => $mergeAcquisition->company_description ?? 'N/D',
                ],
            )->values(),
            'tableState' => [
                'columnFilters' => array_values(array_filter([
                    $identificationCode !== ''
                        ? ['id' => 'opportunityCode', 'value' => $identificationCode]
                        : null,
                    $economicActivityId > 0
                        ? ['id' => 'activitySector', 'value' => (string) $economicActivityId]
                        : null,
                    $legalEntity !== ''
                        ? ['id' => 'legalEntity', 'value' => $legalEntity]
                        : null,
                    $activityDescription !== ''
                        ? ['id' => 'activityDescription', 'value' => $activityDescription]
                        : null,
                    $atecoCode !== ''
                        ? ['id' => 'atecoCode', 'value' => $atecoCode]
                        : null,
                    $headquarters !== ''
                        ? ['id' => 'headquarters', 'value' => $headquarters]
                        : null,
                    $favorite !== null
                        ? ['id' => 'favorite', 'value' => $favorite]
                        : null,
                ])),
                'sorting' => [
                    [
                        'id' => $this->resolveSortId($sortColumn),
                        'desc' => $sortDirection === 'desc',
                    ],
                ],
                'pagination' => [
                    'pageIndex' => max($opportunities->currentPage() - 1, 0),
                    'pageSize' => $opportunities->perPage(),
                ],
            ],
            'rowCount' => $opportunities->total(),
            'pageCount' => $opportunities->lastPage(),
            'filterOptions' => [
                'economicActivities' => MergeAcquisitionEconomicActivity::query()
                    ->where('active', true)
                    ->orderBy('activity_name')
                    ->get()
                    ->map(fn (MergeAcquisitionEconomicActivity $activity): array => [
                        'label' => $activity->activity_name,
                        'value' => (string) $activity->id,
                    ])
                    ->values(),
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
    public function create(): Response {
        return Inertia::render('merge_acquisition/create', [
            'economicActivities' => MergeAcquisitionEconomicActivity::query()
                ->where('active', true)
                ->orderBy('activity_name')
                ->get()
                ->map(fn (MergeAcquisitionEconomicActivity $activity): array => [
                    'label' => $activity->activity_name,
                    'value' => (string) $activity->id,
                ])
                ->values(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MergeAcquisitionRequest $request): void {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(MergeAcquisition $mergeAcquisition): void {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MergeAcquisition $mergeAcquisition): void {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MergeAcquisition $mergeAcquisition): void {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MergeAcquisition $mergeAcquisition): void {
        //
    }

    private function resolvePageSize(int $pageSize): int {
        $allowedPageSizes = [5, 10, 20, 50, 100];

        if (! in_array($pageSize, $allowedPageSizes, true)) {
            return 10;
        }

        return $pageSize;
    }

    private function resolveSortColumn(string $sortColumn): string {
        $allowedSortColumns = [
            'opportunityCode' => 'identification_code',
            'legalEntity' => 'legal_entity',
            'activityDescription' => 'company_description',
            'atecoCode' => 'ateco_code',
        ];

        return $allowedSortColumns[$sortColumn] ?? 'identification_code';
    }

    private function resolveSortId(string $sortColumn): string {
        $sortIds = [
            'identification_code' => 'opportunityCode',
            'legal_entity' => 'legalEntity',
            'company_description' => 'activityDescription',
            'ateco_code' => 'atecoCode',
        ];

        return $sortIds[$sortColumn] ?? 'opportunityCode';
    }

    private function resolveFavoriteFilter(string $favorite): ?bool {
        if ($favorite === 'true') {
            return true;
        }

        if ($favorite === 'false') {
            return false;
        }

        return null;
    }

    private function formatHeadquarters(MergeAcquisition $mergeAcquisition): string {
        $operativeLocation = implode(', ', array_filter([
            $mergeAcquisition->headquarters_operative_province,
            $mergeAcquisition->headquarters_operative_country,
        ]));

        if ($operativeLocation !== '') {
            return $operativeLocation;
        }

        $legalLocation = implode(', ', array_filter([
            $mergeAcquisition->headquarters_legal_province,
            $mergeAcquisition->headquarters_legal_country,
        ]));

        if ($legalLocation !== '') {
            return $legalLocation;
        }

        return 'N/D';
    }
}
