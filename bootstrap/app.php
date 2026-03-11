<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom Inertia error pages are currently disabled on purpose.
        // In local development we want Laravel's default error handling so
        // unexpected exceptions remain fully visible.
        //
        // To re-enable the custom error page flow, restore a respond() handler
        // here and route statuses like 403/404/429/500/503 to
        // resources/js/pages/error-page.tsx.
        //es.
        //
        // $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
        //            $status = $response->getStatusCode();
        //
        //            if ($status === 419) {
        //                return back()->with('flash.error', 'La sessione e` scaduta. Riprova.');
        //            }
        //
        //            if (! in_array($status, [403, 404, 409, 429, 500, 503], true)) {
        //                return $response;
        //            }
        //
        //            if ($status === 500 && app()->environment('local')) {
        //                return $response;
        //            }
        //
        //            return Inertia::render('error-page', [
        //                'status' => $status,
        //            ])->toResponse($request)->setStatusCode($status);
        //        });

    })->create();
