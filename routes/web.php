<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DueDiligenceController;
use App\Http\Controllers\DueDiligenceCustomItemController;
use App\Http\Controllers\DueDiligenceItemAttachmentController;
use App\Http\Controllers\DueDiligenceItemNotesController;
use App\Http\Controllers\DueDiligenceItemStatusController;
use App\Http\Controllers\DueDiligenceTemplateController;
use App\Http\Controllers\DueDiligenceTemplateItemController;
use App\Http\Controllers\MergeAcquisitionController;
use App\Http\Controllers\MergeAcquisitionContactRequestController;
use App\Http\Controllers\MergeAcquisitionFavoriteController;
use App\Http\Controllers\MyOppurtunitiesController;
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
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get(
        'merge_acquisition/buy_side',
        [MergeAcquisitionController::class, 'buySide'],
    )->name('merge_acquisition.buy_side');
    Route::get(
        'merge_acquisition/sell_side',
        [MergeAcquisitionController::class, 'sellSide'],
    )->name('merge_acquisition.sell_side');
    Route::resource('merge_acquisition', MergeAcquisitionController::class);
    Route::resource(
        'merge_acquisition.due_diligences',
        DueDiligenceController::class,
    )->shallow();
    Route::resource(
        'due_diligence_templates',
        DueDiligenceTemplateController::class,
    );
    Route::resource(
        'due_diligence_templates.items',
        DueDiligenceTemplateItemController::class,
    )->shallow()->only(['store', 'update', 'destroy']);
    Route::get(
        'merge_acquisition/{mergeAcquisition}/attachments/{attachment}/download',
        [MergeAcquisitionController::class, 'downloadAttachment'],
    )->name('merge_acquisition.attachment.download');
    Route::post(
        'due_diligences/{dueDiligence}/custom-items',
        [DueDiligenceCustomItemController::class, 'store'],
    )->name('due_diligences.custom_items.store');
    Route::delete(
        'due_diligence_items/{dueDiligenceItem}/custom',
        [DueDiligenceCustomItemController::class, 'destroy'],
    )->name('due_diligence_items.custom.destroy');
    Route::patch(
        'due_diligence_items/{dueDiligenceItem}/status',
        [DueDiligenceItemStatusController::class, 'update'],
    )->name('due_diligence_items.status.update');
    Route::patch(
        'due_diligence_items/{dueDiligenceItem}/notes',
        [DueDiligenceItemNotesController::class, 'update'],
    )->name('due_diligence_items.notes.update');
    Route::post(
        'due_diligence_items/{dueDiligenceItem}/attachments',
        [DueDiligenceItemAttachmentController::class, 'store'],
    )->name('due_diligence_items.attachments.store');
    Route::get(
        'due_diligence_items/{dueDiligenceItem}/attachments/{attachment}/download',
        [DueDiligenceItemAttachmentController::class, 'download'],
    )->name('due_diligence_items.attachments.download');
    Route::delete(
        'due_diligence_items/{dueDiligenceItem}/attachments/{attachment}',
        [DueDiligenceItemAttachmentController::class, 'destroy'],
    )->name('due_diligence_items.attachments.destroy');

    Route::controller(MyOppurtunitiesController::class)
        ->prefix('merge_acquisition_mine')
        ->name('merge_acquisition_mine.')
        ->group(function (): void {
            Route::get('/', 'index')->name('index');
            Route::get('/buy_side', 'buySide')->name('buy_side');
            Route::get('/sell_side', 'sellSide')->name('sell_side');
        });

    Route::post(
        'merge_acquisition/{mergeAcquisition}/favorite',
        [MergeAcquisitionFavoriteController::class, 'store'],
    )->name('merge_acquisition.favorite.store');
    Route::delete(
        'merge_acquisition/{mergeAcquisition}/favorite',
        [MergeAcquisitionFavoriteController::class, 'destroy'],
    )->name('merge_acquisition.favorite.destroy');
    Route::post(
        'merge_acquisition/{mergeAcquisition}/contact-request',
        [MergeAcquisitionContactRequestController::class, 'store'],
    )->name('merge_acquisition.contact_request.store');
});

require __DIR__.'/settings.php';
