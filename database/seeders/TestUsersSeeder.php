<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder {
    public function run(): void {
        $users = [
            [
                'name' => 'Test Admin 1',
                'email' => 'admin1@local.test',
            ],
            [
                'name' => 'Test Admin 2',
                'email' => 'admin2@local.test',
            ],
            [
                'name' => 'Test Admin 3',
                'email' => 'admin3@local.test',
            ],
            [
                'name' => 'Test Customer 1',
                'email' => 'customer1@local.test',
            ],
            [
                'name' => 'Test Customer 2',
                'email' => 'customer2@local.test',
            ],
            [
                'name' => 'Test Customer 3',
                'email' => 'customer3@local.test',
            ],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ],
            );
        }
    }
}
