<?php

namespace App\Support\Trivy\Enums;

enum SecurityFindingEventType: string {
    case New = 'new';
    case StillOpen = 'still_open';
    case Fixed = 'fixed';
    case Reopened = 'reopened';
    case Ignored = 'ignored';
}
