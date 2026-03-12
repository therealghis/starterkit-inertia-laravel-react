<?php

namespace App\Providers;

use App\Support\Trivy\FileSecurityRawReportRepository;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider {
    /**
     * Register any application services.
     */
    public function register(): void {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }

        $this->app->bind(SecurityRawReportRepositoryInterface::class, FileSecurityRawReportRepository::class);

        $this->app->singleton(
            \Illuminate\Contracts\Debug\ExceptionHandler::class,
            \Shellrent\KrakenClient\Laravel\KrakenExceptionHandler::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
