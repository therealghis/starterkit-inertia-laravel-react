<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class ErrorPageTest extends TestCase {
    use RefreshDatabase;

    public function test_missing_pages_are_rendered_with_the_inertia_error_page(): void {
        $this->get('/definitely-missing-page')
            ->assertNotFound()
            ->assertInertia(
                fn (Assert $page) => $page
                ->component('error-page')
                ->where('status', 404),
            );
    }

    public function test_forbidden_pages_are_rendered_with_the_inertia_error_page(): void {
        if (! Features::canManageTwoFactorAuthentication()) {
            $this->markTestSkipped('Two-factor authentication is not enabled.');
        }

        config(['fortify.features' => []]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->get(route('two-factor.show'))
            ->assertForbidden()
            ->assertInertia(
                fn (Assert $page) => $page
                ->component('error-page')
                ->where('status', 403),
            );
    }
}
