<?php

namespace App\Enums;

enum DueDiligenceItemStatus: string {
    public const string OPEN = 'open';
    public const string IN_PROGRESS = 'in_progress';
    public const string COMPLETED = 'completed';
    public const string NOT_APPLICABLE = 'not_applicable';

    public function label(): string {
        return match ($this) {
            self::OPEN => 'Aperto',
            self::IN_PROGRESS => 'In corso',
            self::COMPLETED => 'Completato',
            self::NOT_APPLICABLE => 'Non applicabile',
            default => 'N/A',
        };
    }

    public function values(): array {
        return [
            self::OPEN,
            self::IN_PROGRESS,
            self::COMPLETED,
            self::NOT_APPLICABLE,
        ];
    }
}
