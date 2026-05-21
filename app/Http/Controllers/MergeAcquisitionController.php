<?php

namespace App\Http\Controllers;

use App\Enums\MergeAcquisitionType;
use App\Http\Requests\MergeAcquisitionEditRequest;
use App\Http\Requests\MergeAcquisitionRequest;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionAttachment;
use App\Models\MergeAcquisitionEconomicActivity;
use App\Models\MergeAcquisitionFinancial;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
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

    protected function renderListing(Request $request, ?string $activeType): Response {
        $user = $request->user();
        $page = max($request->integer('page', 1), 1);
        $pageSize = $this->resolvePageSize($request->integer('page_size', 10));
        $sortColumn = $this->resolveSortColumn($request->string('sort')->toString());
        $sortDirection = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';

        $identificationCode = trim($request->string('identification_code')->toString());
        $economicActivityId = $request->integer('economic_activity_id');
        $legalEntity = trim($request->string('legal_entity')->toString());
        $product = trim($request->string('product')->toString());
        $atecoCode = trim($request->string('ateco_code')->toString());
        $headquarters = trim($request->string('headquarters')->toString());
        $favorite = $this->resolveFavoriteFilter($request->string('favorite')->toString());

        $query = $this->baseListingQuery($request)
            ->with([
                'economicActivity:id,activity_name',
                'favoritePeople' => fn ($builder) => $builder
                    ->where('user_id', $user?->id)
                    ->where('active', true),
                'contactRequests' => fn ($builder) => $builder
                    ->where('requester_email', $user?->email),
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

        if ($product !== '') {
            $query->where('product', 'like', "%{$product}%");
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

        $summaryQuery = $this->baseListingQuery($request);

        return Inertia::render($this->listingComponent(), [
            'listingScope' => $this->listingScope(),
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
                fn (MergeAcquisition $mergeAcquisition): array => $this->mapOpportunityRow(
                    $mergeAcquisition,
                    $user?->id,
                ),
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
                    $product !== ''
                        ? ['id' => 'product', 'value' => $product]
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
                'activeOpportunities' => (clone $summaryQuery)->count(),
                'buySideOpportunities' => (clone $summaryQuery)
                    ->where('intent_type', MergeAcquisitionType::BUY_SIDE)
                    ->count(),
                'sellSideOpportunities' => (clone $summaryQuery)
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
            'economicActivities' => $this->economicActivityOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MergeAcquisitionRequest $request): RedirectResponse {
        $validated = $request->validated();

        MergeAcquisition::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
            'real_estate' => (bool) ($validated['real_estate'] ?? false),
            'active' => true,
        ]);

        return $this->limitToAuthenticatedUser() ? to_route('merge_acquisition_mine.index') : to_route('merge_acquisition.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(MergeAcquisition $mergeAcquisition): Response {
        $canViewSensitiveDetails = $this->canViewSensitiveDetails($mergeAcquisition);

        abort_unless($mergeAcquisition->active || $canViewSensitiveDetails, 404);

        $mergeAcquisition->load([
            'economicActivity:id,activity_name',
            'attachments' => fn ($builder) => $builder
                ->where('active', true)
                ->orderByDesc('created_at'),
            'financials' => fn ($builder) => $builder
                ->where('active', true)
                ->orderByDesc('year')
                ->orderByDesc('created_at'),
        ]);

        return Inertia::render('merge_acquisition/show', [
            'mergeAcquisition' => [
                'id' => $mergeAcquisition->id,
                'identification_code' => $mergeAcquisition->identification_code,
                'intent_type' => $mergeAcquisition->intent_type,
                'economic_activity' => $mergeAcquisition->economicActivity?->activity_name ?? 'N/D',
                'product' => $mergeAcquisition->product ?? 'N/D',
                'legal_entity' => $mergeAcquisition->legal_entity ?? 'N/D',
                'establishment_date' => $mergeAcquisition->establishment_date ?? 'N/D',
                'ateco_code' => $mergeAcquisition->ateco_code ?? 'N/D',
                'nominal_capital' => $mergeAcquisition->nominal_capital ?? 'N/D',
                'headquarters_legal_province' => $mergeAcquisition->headquarters_legal_province ?? 'N/D',
                'headquarters_legal_country' => $mergeAcquisition->headquarters_legal_country ?? 'N/D',
                'headquarters_operative_province' => $mergeAcquisition->headquarters_operative_province ?? 'N/D',
                'headquarters_operative_country' => $mergeAcquisition->headquarters_operative_country ?? 'N/D',
                'total_employees' => $mergeAcquisition->total_employees === null
                    ? 'N/D'
                    : (string) $mergeAcquisition->total_employees,
                'selling_type' => $mergeAcquisition->selling_type ?? 'N/D',
                'selling_reason' => $mergeAcquisition->selling_reason ?? 'N/D',
                'real_estate' => $mergeAcquisition->real_estate,
            ],
            'sensitiveDetails' => $canViewSensitiveDetails
                ? [
                    'company_name' => $mergeAcquisition->company_name ?? 'N/D',
                    'company_description' => $mergeAcquisition->company_description ?? 'N/D',
                ]
                : null,
            'attachments' => $mergeAcquisition->attachments
                ->map(fn (MergeAcquisitionAttachment $attachment): array => [
                    'id' => $attachment->id,
                    'filename' => $attachment->filename,
                    'mimetype' => $attachment->mimetype,
                    'file_path' => $attachment->file_path,
                    'download_url' => route('merge_acquisition.attachment.download', [
                        'mergeAcquisition' => $mergeAcquisition,
                        'attachment' => $attachment,
                    ]),
                    'created_at' => $attachment->created_at?->format('Y-m-d H:i:s'),
                ])
                ->values(),
            'financials' => $mergeAcquisition->financials
                ->map(fn (MergeAcquisitionFinancial $financial): array => [
                    'id' => $financial->id,
                    'year' => $financial->year,
                    'sales' => $financial->sales,
                    'income' => $financial->income,
                    'pfn' => $financial->pfn,
                    'ebitda' => $financial->ebitda,
                    'debt' => $financial->debt,
                    'created_at' => $financial->created_at?->format('Y-m-d H:i:s'),
                ])
                ->values(),
            'canViewSensitiveDetails' => $canViewSensitiveDetails,
            'pageUrl' => route('merge_acquisition.show', $mergeAcquisition),
            'editUrl' => $canViewSensitiveDetails
                ? route('merge_acquisition.edit', $mergeAcquisition)
                : null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MergeAcquisition $mergeAcquisition): Response {
        $this->ensureOwnership($mergeAcquisition);

        $mergeAcquisition->load([
            'attachments' => fn ($builder) => $builder
                ->where('active', true)
                ->orderByDesc('created_at'),
            'financials' => fn ($builder) => $builder
                ->where('active', true)
                ->orderByDesc('year')
                ->orderByDesc('created_at'),
        ]);

        return Inertia::render('merge_acquisition/edit', [
            'economicActivities' => $this->economicActivityOptions(),
            'mergeAcquisition' => [
                'id' => $mergeAcquisition->id,
                'merge_acquisition_economic_activity_id' => $mergeAcquisition->merge_acquisition_economic_activity_id === null
                    ? ''
                    : (string) $mergeAcquisition->merge_acquisition_economic_activity_id,
                'identification_code' => $mergeAcquisition->identification_code,
                'intent_type' => $mergeAcquisition->intent_type,
                'company_name' => $mergeAcquisition->company_name ?? '',
                'company_description' => $mergeAcquisition->company_description ?? '',
                'product' => $mergeAcquisition->product ?? '',
                'legal_entity' => $mergeAcquisition->legal_entity ?? '',
                'establishment_date' => $mergeAcquisition->establishment_date ?? '',
                'ateco_code' => $mergeAcquisition->ateco_code ?? '',
                'nominal_capital' => $mergeAcquisition->nominal_capital ?? '',
                'headquarters_legal_province' => $mergeAcquisition->headquarters_legal_province ?? '',
                'headquarters_legal_country' => $mergeAcquisition->headquarters_legal_country ?? '',
                'headquarters_operative_province' => $mergeAcquisition->headquarters_operative_province ?? '',
                'headquarters_operative_country' => $mergeAcquisition->headquarters_operative_country ?? '',
                'total_employees' => $mergeAcquisition->total_employees === null
                    ? ''
                    : (string) $mergeAcquisition->total_employees,
                'selling_type' => $mergeAcquisition->selling_type ?? '',
                'selling_reason' => $mergeAcquisition->selling_reason ?? '',
                'real_estate' => $mergeAcquisition->real_estate ?? false,
            ],
            'attachments' => $mergeAcquisition->attachments
                ->map(fn (MergeAcquisitionAttachment $attachment): array => [
                    'id' => $attachment->id,
                    'filename' => $attachment->filename,
                    'mimetype' => $attachment->mimetype,
                    'file_path' => $attachment->file_path,
                    'download_url' => route('merge_acquisition.attachment.download', [
                        'mergeAcquisition' => $mergeAcquisition,
                        'attachment' => $attachment,
                    ]),
                    'created_at' => $attachment->created_at?->format('Y-m-d H:i:s'),
                ])
                ->values(),
            'financials' => $mergeAcquisition->financials
                ->map(fn (MergeAcquisitionFinancial $financial): array => [
                    'id' => $financial->id,
                    'year' => $financial->year,
                    'sales' => $financial->sales,
                    'income' => $financial->income,
                    'pfn' => $financial->pfn,
                    'ebitda' => $financial->ebitda,
                    'debt' => $financial->debt,
                    'created_at' => $financial->created_at?->format('Y-m-d H:i:s'),
                ])
                ->values(),
            'pageUrl' => route('merge_acquisition.edit', $mergeAcquisition),
        ]);
    }

    public function downloadAttachment(MergeAcquisition $mergeAcquisition, MergeAcquisitionAttachment $attachment): StreamedResponse {
        abort_unless($mergeAcquisition->active || $this->canViewSensitiveDetails($mergeAcquisition), 404);
        abort_unless($attachment->merge_acquisition_id === $mergeAcquisition->id, 404);
        abort_unless(Storage::disk('local')->exists($attachment->file_path), 404);

        return Storage::disk('local')->download(
            $attachment->file_path,
            $attachment->filename,
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        MergeAcquisitionEditRequest $request,
        MergeAcquisition $mergeAcquisition,
    ): RedirectResponse {
        $validated = $request->validated();

        DB::transaction(function () use (
            $request,
            $mergeAcquisition,
            $validated,
        ): void {
            $mergeAcquisition->update([
                ...Arr::except($validated, ['attachments', 'financials']),
                'real_estate' => (bool) ($validated['real_estate'] ?? false),
            ]);

            foreach ($request->file('attachments', []) as $attachment) {
                $mergeAcquisition->attachments()->create([
                    'mimetype' => $attachment->getClientMimeType() ?? 'application/octet-stream',
                    'file_path' => $attachment->store(
                        "merge-acquisition/{$mergeAcquisition->id}/attachments",
                        'local',
                    ),
                    'filename' => $attachment->getClientOriginalName(),
                    'active' => true,
                ]);
            }

            foreach ($validated['financials'] ?? [] as $financialData) {
                $payload = [
                    ...Arr::except($financialData, ['id']),
                    'active' => true,
                ];

                if (isset($financialData['id'])) {
                    $mergeAcquisition->financials()
                        ->whereKey($financialData['id'])
                        ->firstOrFail()
                        ->update($payload);

                    continue;
                }

                $mergeAcquisition->financials()->create($payload);
            }
        });

        return to_route('merge_acquisition.edit', $mergeAcquisition);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MergeAcquisition $mergeAcquisition): RedirectResponse {
        $this->ensureOwnership($mergeAcquisition);

        $mergeAcquisition->delete();

        return $this->limitToAuthenticatedUser() ? to_route('merge_acquisition_mine.index') : to_route('merge_acquisition.index');
    }

    protected function baseListingQuery(Request $request): Builder {
        $query = MergeAcquisition::query()->where('active', true);

        if ($this->limitToAuthenticatedUser()) {
            $query->where('user_id', $request->user()->id);
        }

        return $query;
    }

    protected function listingComponent(): string {
        return 'merge_acquisition/index';
    }

    protected function listingScope(): string {
        return 'all';
    }

    protected function limitToAuthenticatedUser(): bool {
        return false;
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{label: string, value: string}>
     */
    private function economicActivityOptions(): \Illuminate\Support\Collection {
        return MergeAcquisitionEconomicActivity::query()
            ->where('active', true)
            ->orderBy('activity_name')
            ->get()
            ->map(fn (MergeAcquisitionEconomicActivity $activity): array => [
                'label' => $activity->activity_name,
                'value' => (string) $activity->id,
            ])
            ->values();
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
            'product' => 'product',
            'atecoCode' => 'ateco_code',
        ];

        return $allowedSortColumns[$sortColumn] ?? 'identification_code';
    }

    private function resolveSortId(string $sortColumn): string {
        $sortIds = [
            'identification_code' => 'opportunityCode',
            'legal_entity' => 'legalEntity',
            'product' => 'product',
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

    /**
     * @return array{
     *     id: int,
     *     opportunityCode: string,
     *     operationType: string,
     *     activitySector: string,
     *     legalEntity: string,
     *     product: string,
     *     atecoCode: string,
     *     headquarters: string,
     *     favorite: bool,
     *     canDelete: bool,
     *     canViewSensitiveDetails: bool,
     *     canRequestContact: bool,
     *     hasRequestedContact: bool,
     *     companyName: string,
     *     companyDescription: string
     * }
     */
    private function mapOpportunityRow(MergeAcquisition $mergeAcquisition, ?int $authenticatedUserId): array {
        $canViewSensitiveDetails = $this->canViewSensitiveDetails($mergeAcquisition);

        return [
            'id' => $mergeAcquisition->id,
            'opportunityCode' => $mergeAcquisition->identification_code,
            'operationType' => $mergeAcquisition->intent_type,
            'activitySector' => $mergeAcquisition->economicActivity?->activity_name ?? 'N/D',
            'legalEntity' => $mergeAcquisition->legal_entity ?? 'N/D',
            'product' => $mergeAcquisition->product ?? 'N/D',
            'atecoCode' => $mergeAcquisition->ateco_code ?? 'N/D',
            'headquarters' => $this->formatHeadquarters($mergeAcquisition),
            'favorite' => $mergeAcquisition->favoritePeople->isNotEmpty(),
            'canDelete' => $this->limitToAuthenticatedUser(),
            'canViewSensitiveDetails' => $canViewSensitiveDetails,
            'canRequestContact' => $authenticatedUserId !== null
                && $mergeAcquisition->user_id !== $authenticatedUserId,
            'hasRequestedContact' => $mergeAcquisition->contactRequests->isNotEmpty(),
            'companyName' => $canViewSensitiveDetails
                ? ($mergeAcquisition->company_name ?? 'N/D')
                : 'N/D',
            'companyDescription' => $canViewSensitiveDetails
                ? ($mergeAcquisition->company_description ?? 'N/D')
                : 'N/D',
        ];
    }

    private function ensureOwnership(MergeAcquisition $mergeAcquisition): void {
        abort_unless(
            request()->user()?->id === $mergeAcquisition->user_id,
            403,
        );
    }

    private function canViewSensitiveDetails(MergeAcquisition $mergeAcquisition): bool {
        return $mergeAcquisition->user_id === auth()->user()?->id;
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
