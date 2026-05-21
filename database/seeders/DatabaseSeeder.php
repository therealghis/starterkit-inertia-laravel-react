<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    /**
     * Seed the application's database.
     */
    public function run(): void {
        User::query()->updateOrCreate([
            'email' => config('starter.seed_user.email'),
        ], [
            'name' => config('starter.seed_user.name'),
            'email_verified_at' => now(),
            'password' => Hash::make(config('starter.seed_user.password')),
        ]);

        $this->call([
            TestUsersSeeder::class,
            MergeAcquisitionEconomicActivitySeeder::class,
            DueDiligenceTemplateSeeder::class,
            MergeAcquisitionSeeder::class,
            MergeAcquisitionContactRequestEmailSeeder::class,
        ]);
    }
}
