<?php

namespace App\Support\Trivy\Enums;

enum SecurityFindingStatus: string {
    case Open = 'open';
    case Fixed = 'fixed';
    case Ignored = 'ignored';
    case AcceptedRisk = 'accepted_risk';
}
