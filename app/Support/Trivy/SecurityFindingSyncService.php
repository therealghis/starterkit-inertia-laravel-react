<?php

namespace App\Support\Trivy;

use App\Models\Trivy\SecurityFinding;
use App\Models\Trivy\SecurityFindingEvent;
use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Dto\SecurityRawReport;
use App\Support\Trivy\Enums\SecurityFindingEventType;
use App\Support\Trivy\Enums\SecurityFindingStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SecurityFindingSyncService {
    public function __construct(
        private TrivyReportParser $parser,
        private SecurityDeltaService $deltaService,
    ) {
    }

    /**
     * @param  array<int, SecurityRawReport|array<string, mixed>>  $reports
     * @return array<string, mixed>
     */
    public function sync(SecurityScan $scan, array $reports): array {
        $currentFindings = collect($reports)
            ->flatMap(fn (SecurityRawReport|array $report): Collection => $this->parser->parseReport($report))
            ->values();

        $previousFindings = SecurityFinding::query()->get();
        $delta = $this->deltaService->calculate($currentFindings, $previousFindings);
        $previousByFingerprint = $previousFindings->keyBy('fingerprint');

        DB::connection($scan->getConnectionName())->transaction(function () use ($delta, $previousByFingerprint, $scan): void {
            foreach ($delta['new'] as $finding) {
                $securityFinding = SecurityFinding::create($this->newFindingAttributes($finding, $scan));
                $this->createEvent($securityFinding, $scan, SecurityFindingEventType::New, $finding);
            }

            foreach ($delta['still_open'] as $finding) {
                $securityFinding = $previousByFingerprint->get($finding['fingerprint']);

                if (is_null($securityFinding)) {
                    continue;
                }

                $securityFinding->updateOrFail($this->openFindingAttributes($finding, $scan));
            }

            foreach ($delta['reopened'] as $finding) {
                $securityFinding = $previousByFingerprint->get($finding['fingerprint']);

                if (is_null($securityFinding)) {
                    continue;
                }

                $securityFinding->updateOrFail($this->openFindingAttributes($finding, $scan));
                $this->createEvent($securityFinding->fresh(), $scan, SecurityFindingEventType::Reopened, $finding);
            }

            foreach ($delta['fixed'] as $finding) {
                if (! $finding instanceof SecurityFinding) {
                    continue;
                }

                $finding->updateOrFail([
                    'status' => SecurityFindingStatus::Fixed,
                ]);

                $this->createEvent($finding->fresh(), $scan, SecurityFindingEventType::Fixed, [
                    'fingerprint' => $finding->fingerprint,
                    'vulnerability_id' => $finding->vulnerability_id,
                    'package' => $finding->pkg_name,
                    'installed_version' => $finding->installed_version,
                    'target' => $finding->target,
                    'class' => $finding->class,
                    'type' => $finding->type,
                ]);
            }
        });

        return [
            'current' => $delta['current'],
            'new' => $delta['new'],
            'still_open' => $delta['still_open'],
            'fixed' => $delta['fixed'],
            'reopened' => $delta['reopened'],
            'summary' => [
                'critical_count' => $this->severityCount($delta['current'], 'CRITICAL'),
                'high_count' => $this->severityCount($delta['current'], 'HIGH'),
                'medium_count' => $this->severityCount($delta['current'], 'MEDIUM'),
                'low_count' => $this->severityCount($delta['current'], 'LOW'),
                'unknown_count' => $this->severityCount($delta['current'], 'UNKNOWN'),
                'new_count' => $delta['new']->count(),
                'fixed_count' => $delta['fixed']->count(),
                'reopened_count' => $delta['reopened']->count(),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $finding
     * @return array<string, mixed>
     */
    private function newFindingAttributes(array $finding, SecurityScan $scan): array {
        return [
            ...$this->openFindingAttributes($finding, $scan),
            'first_seen_at' => $scan->finished_at,
            'first_seen_scan_id' => $scan->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $finding
     * @return array<string, mixed>
     */
    private function openFindingAttributes(array $finding, SecurityScan $scan): array {
        return [
            'fingerprint' => $finding['fingerprint'],
            'vulnerability_id' => $finding['vulnerability_id'] ?? null,
            'pkg_name' => $finding['package'] ?? '',
            'installed_version' => $finding['installed_version'] ?? null,
            'fixed_version' => $finding['fixed_version'] ?? null,
            'severity' => $finding['severity'] ?? 'UNKNOWN',
            'severity_source' => $finding['metadata']['finding']['SeveritySource'] ?? null,
            'title' => $finding['title'] ?? null,
            'primary_url' => $finding['primary_url'] ?? null,
            'target' => $finding['target'] ?? null,
            'class' => $finding['class'] ?? null,
            'type' => $finding['type'] ?? null,
            'status' => SecurityFindingStatus::Open,
            'last_seen_at' => $scan->finished_at,
            'last_seen_scan_id' => $scan->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function createEvent(
        SecurityFinding $finding,
        SecurityScan $scan,
        SecurityFindingEventType $eventType,
        array $payload,
    ): void {
        SecurityFindingEvent::create([
            'security_finding_id' => $finding->id,
            'security_scan_id' => $scan->id,
            'event_type' => $eventType,
            'payload' => $payload,
            'created_at' => $scan->finished_at,
        ]);
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $findings
     */
    private function severityCount(Collection $findings, string $severity): int {
        return $findings
            ->filter(fn (array $finding): bool => ($finding['severity'] ?? 'UNKNOWN') === $severity)
            ->count();
    }
}
