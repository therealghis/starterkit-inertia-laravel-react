<?php

namespace App\Support\Trivy\Enums;

enum SecurityScanStatus: string {
    case Running = 'running';
    case Completed = 'completed';
    case Failed = 'failed';
}
