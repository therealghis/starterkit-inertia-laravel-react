<?php

namespace App\Support\Trivy\Enums;

enum SecurityScanSeverity: string {
    case Critical = 'CRITICAL';
    case High = 'HIGH';
    case Medium = 'MEDIUM';
    case Low = 'LOW';
    case Unknown = 'UNKNOWN';
}
