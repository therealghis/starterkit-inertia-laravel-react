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
    Route::get(
        'merge_acquisition/buy_side',
        [MergeAcquisitionController::class, 'buySide'],
    )->name('merge_acquisition.buy_side');
    Route::get(
        'merge_acquisition/sell_side',
        [MergeAcquisitionController::class, 'sellSide'],
    )->name('merge_acquisition.sell_side');
    Route::resource('merge_acquisition', MergeAcquisitionController::class);
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
