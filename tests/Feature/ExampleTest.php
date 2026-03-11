<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase {
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page_from_home() {
        $response = $this->get(route('home'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_are_redirected_to_the_dashboard_from_home() {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertRedirect(route('dashboard'));
    }
}
