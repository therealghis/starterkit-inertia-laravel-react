<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale {
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response {
        $locale = $request->session()->get('locale', config('app.locale'));
        $supportedLocales = array_keys(config('localization.supported_locales'));

        if (! in_array($locale, $supportedLocales, true)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
