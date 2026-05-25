<?php

namespace App\Enums;

enum DueDiligenceItemStatus: string {
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case NOT_APPLICABLE = 'not_applicable';

    public static function label(self|string $status): string {
        if (is_string($status)) {
            $status = self::tryFrom($status);
        }

        return match ($status) {
            self::OPEN => 'Aperto',
            self::IN_PROGRESS => 'In corso',
            self::COMPLETED => 'Completato',
            self::NOT_APPLICABLE => 'Non applicabile',
            default => 'N/A',
        };
    }

    public static function values(): array {
        return array_map(
            fn (self $status) => $status->value,
            self::cases(),
        );
    }
}
