<?php

use App\Http\Controllers\MergeAcquisitionController;
use App\Http\Controllers\MergeAcquisitionFavoriteController;
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
    Route::resource('merge_acquisition', MergeAcquisitionController::class);
    Route::get(
        'merge_acquisition/{active_type}',
        [MergeAcquisitionController::class, 'activeType'],
    )->whereIn('active_type', ['buy_side', 'sell_side'])->name('merge_acquisition.active_type');
    Route::post(
        'merge_acquisition/{mergeAcquisition}/favorite',
        [MergeAcquisitionFavoriteController::class, 'store'],
    )->name('merge_acquisition.favorite.store');
    Route::delete(
        'merge_acquisition/{mergeAcquisition}/favorite',
        [MergeAcquisitionFavoriteController::class, 'destroy'],
    )->name('merge_acquisition.favorite.destroy');
});

require __DIR__.'/settings.php';
