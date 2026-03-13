<?php

namespace App\Support\Trivy;

use App\Support\Trivy\Enums\SecurityFindingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class SecurityDeltaService {
    /**
     * @param  Collection<int, array<string, mixed>|Model>|array<int, array<string, mixed>|Model>  $currentFindings
     * @param  Collection<int, array<string, mixed>|Model>|array<int, array<string, mixed>|Model>  $previousFindings
     * @return array<string, Collection<int, array<string, mixed>|Model>>
     */
    public function calculate(Collection|array $currentFindings, Collection|array $previousFindings): array {
        $currentByFingerprint = $this->findingsByFingerprint($currentFindings);
        $previousByFingerprint = $this->findingsByFingerprint($previousFindings);

        $new = collect();
        $stillOpen = collect();
        $reopened = collect();

        foreach ($currentByFingerprint as $fingerprint => $currentFinding) {
            $previousFinding = $previousByFingerprint->get($fingerprint);

            if (is_null($previousFinding)) {
                $new->push($currentFinding);
                continue;
            }

            if ($this->statusValue($previousFinding) === SecurityFindingStatus::Open->value) {
                $stillOpen->push($currentFinding);
                continue;
            }

            $reopened->push($currentFinding);
        }

        $fixed = collect();

        foreach ($previousByFingerprint as $fingerprint => $previousFinding) {
            if ($this->statusValue($previousFinding) !== SecurityFindingStatus::Open->value) {
                continue;
            }

            if ($currentByFingerprint->has($fingerprint)) {
                continue;
            }

            $fixed->push($previousFinding);
        }

        return [
            'current' => $currentByFingerprint->values(),
            'new' => $new->values(),
            'still_open' => $stillOpen->values(),
            'fixed' => $fixed->values(),
            'reopened' => $reopened->values(),
        ];
    }

    /**
     * @param  Collection<int, array<string, mixed>|Model>|array<int, array<string, mixed>|Model>  $findings
     * @return Collection<string, array<string, mixed>|Model>
     */
    private function findingsByFingerprint(Collection|array $findings): Collection {
        return collect($findings)
            ->filter(fn (array|Model $finding): bool => ! is_null($this->fingerprintValue($finding)))
            ->keyBy(fn (array|Model $finding): string => (string) $this->fingerprintValue($finding));
    }

    private function fingerprintValue(array|Model $finding): ?string {
        if ($finding instanceof Model) {
            return $this->stringValue($finding->getAttribute('fingerprint'));
        }

        return $this->stringValue($finding['fingerprint'] ?? null);
    }

    private function statusValue(array|Model $finding): ?string {
        if ($finding instanceof Model) {
            $status = $finding->getAttribute('status');

            if ($status instanceof SecurityFindingStatus) {
                return $status->value;
            }

            return $this->stringValue($status);
        }

        $status = $finding['status'] ?? null;

        if ($status instanceof SecurityFindingStatus) {
            return $status->value;
        }

        return $this->stringValue($status);
    }

    private function stringValue(mixed $value): ?string {
        $value = is_string($value) ? trim($value) : null;

        return $value === '' ? null : $value;
    }
}
