<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create super admin
        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@trackmate.local',
            'password' => Hash::make('admin123'),
            'salary' => 0,
            'is_admin' => true,
        ]);

        // Optional: create test user
        User::factory()->create([
            'name' => 'test',
            'email' => 'test@example.com',
            'password' => Hash::make('test1234'),
            'salary' => 500000,
        ]);
    }
}

