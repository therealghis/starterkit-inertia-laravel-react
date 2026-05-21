<?php

namespace App\Http\Controllers;

use App\Enums\MergeAcquisitionType;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionContactRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller {
    public function __invoke(Request $request): Response {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('dashboard', [
            'kpis' => $this->buildKpis($user),
            'myOpportunityBreakdown' => $this->buildMyOpportunityBreakdown($user),
            'contactRequestsReceivedTrend' => $this->buildContactRequestsReceivedTrend($user),
            'topInterestingOpportunities' => $this->buildTopInterestingOpportunities($user),
        ]);
    }

    /**
     * @return array{
     *     myOpportunities: int,
     *     myOpportunitiesFavoritedByOthers: int,
     *     myOpportunitiesWithContactRequests: int,
     *     myTotalContactRequestsReceived: int,
     *     totalPlatformOpportunities: int
     * }
     */
    private function buildKpis(User $user): array {
        $myOpportunitiesQuery = $this->myActiveOpportunitiesQuery($user);

        return [
            'myOpportunities' => (clone $myOpportunitiesQuery)->count(),
            'myOpportunitiesFavoritedByOthers' => (clone $myOpportunitiesQuery)
                ->whereHas('favoritePeople', function (Builder $builder) use ($user): void {
                    $builder
                        ->where('active', true)
                        ->where('user_id', '!=', $user->id);
                })
                ->count(),
            'myOpportunitiesWithContactRequests' => (clone $myOpportunitiesQuery)
                ->whereHas('contactRequests')
                ->count(),
            'myTotalContactRequestsReceived' => MergeAcquisitionContactRequest::query()
                ->whereHas('mergeAcquisition', function (Builder $builder) use ($user): void {
                    $builder
                        ->where('user_id', $user->id)
                        ->where('active', true);
                })
                ->count(),
            'totalPlatformOpportunities' => MergeAcquisition::query()
                ->where('active', true)
                ->count(),
        ];
    }

    /**
     * @return array{
     *     buySide: int,
     *     sellSide: int
     * }
     */
    private function buildMyOpportunityBreakdown(User $user): array {
        $myOpportunitiesQuery = $this->myActiveOpportunitiesQuery($user);

        return [
            'buySide' => (clone $myOpportunitiesQuery)
                ->where('intent_type', MergeAcquisitionType::BUY_SIDE)
                ->count(),
            'sellSide' => (clone $myOpportunitiesQuery)
                ->where('intent_type', MergeAcquisitionType::SELL_SIDE)
                ->count(),
        ];
    }

    /**
     * @return array<int, array{date: string, value: int}>
     */
    private function buildContactRequestsReceivedTrend(User $user): array {
        [$startDate, $endDate] = $this->resolveTrendRange();

        $rows = MergeAcquisitionContactRequest::query()
            ->selectRaw('DATE(merge_acquisition_contact_request.created_at) as trend_date')
            ->selectRaw('COUNT(*) as total')
            ->join(
                'merge_acquisition',
                'merge_acquisition.id',
                '=',
                'merge_acquisition_contact_request.merge_acquisition_id',
            )
            ->where('merge_acquisition.user_id', $user->id)
            ->where('merge_acquisition.active', true)
            ->whereBetween('merge_acquisition_contact_request.created_at', [
                $startDate->startOfDay(),
                $endDate->endOfDay(),
            ])
            ->groupBy(DB::raw('DATE(merge_acquisition_contact_request.created_at)'))
            ->orderBy(DB::raw('DATE(merge_acquisition_contact_request.created_at)'))
            ->get();

        return $this->buildTrendSeries($rows, $startDate, $endDate);
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     opportunityCode: string,
     *     operationType: string,
     *     receivedFavoritesCount: int,
     *     receivedContactRequestsCount: int,
     *     totalSignalsCount: int
     * }>
     */
    private function buildTopInterestingOpportunities(User $user): array {
        return $this->myActiveOpportunitiesQuery($user)
            ->select([
                'id',
                'identification_code',
                'intent_type',
            ])
            ->withCount([
                'favoritePeople as received_favorites_count' => function (Builder $builder) use ($user): void {
                    $builder
                        ->where('active', true)
                        ->where('user_id', '!=', $user->id);
                },
                'contactRequests as received_contact_requests_count',
            ])
            ->orderByRaw('(received_favorites_count + received_contact_requests_count) desc')
            ->orderByDesc('received_contact_requests_count')
            ->orderByDesc('received_favorites_count')
            ->orderBy('identification_code')
            ->limit(5)
            ->get()
            ->map(function (MergeAcquisition $mergeAcquisition): array {
                $receivedFavoritesCount = (int) $mergeAcquisition->received_favorites_count;
                $receivedContactRequestsCount = (int) $mergeAcquisition->received_contact_requests_count;

                return [
                    'id' => $mergeAcquisition->id,
                    'opportunityCode' => $mergeAcquisition->identification_code,
                    'operationType' => $mergeAcquisition->intent_type,
                    'receivedFavoritesCount' => $receivedFavoritesCount,
                    'receivedContactRequestsCount' => $receivedContactRequestsCount,
                    'totalSignalsCount' => $receivedFavoritesCount + $receivedContactRequestsCount,
                ];
            })
            ->values()
            ->all();
    }

    private function myActiveOpportunitiesQuery(User $user): Builder {
        return MergeAcquisition::query()
            ->where('user_id', $user->id)
            ->where('active', true);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function resolveTrendRange(): array {
        $endDate = today();

        return [
            $endDate->subDays(29),
            $endDate,
        ];
    }

    /**
     * @param  Collection<int, object{trend_date: string, total: int|string}>  $rows
     * @return array<int, array{date: string, value: int}>
     */
    private function buildTrendSeries(
        Collection $rows,
        CarbonImmutable $startDate,
        CarbonImmutable $endDate,
    ): array {
        $totalsByDate = $rows
            ->mapWithKeys(fn (object $row): array => [
                (string) $row->trend_date => (int) $row->total,
            ]);

        $series = [];
        $day = $startDate;

        while ($day->lessThanOrEqualTo($endDate)) {
            $formattedDate = $day->format('Y-m-d');

            $series[] = [
                'date' => $formattedDate,
                'value' => $totalsByDate->get($formattedDate, 0),
            ];

            $day = $day->addDay();
        }

        return $series;
    }
}
