<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use SoDe\Extend\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UsersSeeder::class,
            SliderSeeder::class,
            IndicatorSeeder::class,
            AboutusSeeder::class,
            TestimonySeeder::class,
            CategorySeeder::class,
            SubCategorySeeder::class,
            BrandSeeder::class,
            StrengthSeeder::class,
            SocialSeeder::class,
            GeneralSeeder::class,
            ItemSeeder::class,
            SystemSeeder::class,
            SystemColorSeeder::class,
            NewUserSeeder::class,
            StatusSeeder::class,
        ]);

        File::save(storage_path('app/pages.json'), '[]');
    }
}
