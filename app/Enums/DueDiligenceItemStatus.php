<?php

namespace App\Enums;

enum DueDiligenceItemStatus: string {
    public const string OPEN = 'open';
    public const string IN_PROGRESS = 'in_progress';
    public const string COMPLETED = 'completed';
    public const string NOT_APPLICABLE = 'not_applicable';

    public static function label($status): string {
        return match ($status) {
            self::OPEN => 'Aperto',
            self::IN_PROGRESS => 'In corso',
            self::COMPLETED => 'Completato',
            self::NOT_APPLICABLE => 'Non applicabile',
            default => 'N/A',
        };
    }

    public static function values(): array {
        return [
            self::OPEN,
            self::IN_PROGRESS,
            self::COMPLETED,
            self::NOT_APPLICABLE,
        ];
    }
}
