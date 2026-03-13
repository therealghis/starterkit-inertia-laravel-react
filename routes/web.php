<?php

use App\Http\Controllers\SecurityScanController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (): RedirectResponse {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
})->name('home');

Route::put('/locale/{locale}', function (Request $request, string $locale): RedirectResponse {
    abort_unless(in_array($locale, array_keys(config('localization.supported_locales')), true), 404);

    $request->session()->put('locale', $locale);

    return back();
})->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/components/server-data-table-demo', 'server-data-table-demo')
        ->name('server-data-table-demo');
    Route::get('/security/scans', [SecurityScanController::class, 'index'])->name('security-scans.index');
});

require __DIR__.'/settings.php';
