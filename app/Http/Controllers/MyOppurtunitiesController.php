<?php

namespace App\Http\Controllers;

class MyOppurtunitiesController extends MergeAcquisitionController {
    protected function listingScope(): string {
        return 'mine';
    }

    protected function limitToAuthenticatedUser(): bool {
        return true;
    }
}
