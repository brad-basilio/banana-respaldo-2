<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::where('email', '=', 'admin@escuelatrasciende.com')->delete();
        User::updateOrCreate([
            'email' => 'root@mundoweb.pe'
        ], [
            'name' => 'Root',
            'lastname' => 'MundoWeb',
            'password' => 'r00tme'
        ])->assignRole('Root');
        User::updateOrCreate([
            'email' => 'admin@mundoweb.pe'
        ], [
            'name' => 'Admin',
            'lastname' => 'MundoWeb',
            'password' => '12345678'
        ])->assignRole('Admin');
        User::updateOrCreate([
            'email' => 'admin@bananalab.pe'
        ], [
            'name' => 'Admin',
            'lastname' => 'BananaLab',
            'password' => 'B@n@n@L@b2025!'
        ])->assignRole('Admin');
    }
}
