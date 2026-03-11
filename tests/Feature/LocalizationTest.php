<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalizationTest extends TestCase {
    public function test_login_page_uses_english_as_default_locale(): void {
        config(['app.locale' => 'en']);

        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/login')
                ->where('locale', 'en'));
    }

    public function test_locale_can_be_switched_and_persisted_in_session(): void {
        $this->put(route('locale.update', 'it'))
            ->assertRedirect();

        $this->withSession(['locale' => 'it'])
            ->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/login')
                ->where('locale', 'it'));
    }
}
