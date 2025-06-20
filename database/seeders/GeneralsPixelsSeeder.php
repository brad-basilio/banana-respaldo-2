<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\General;

class GeneralsPixelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $generals = [
            // Email corporativo
            [
                'correlative' => 'coorporative_email',
                'name' => 'Email Corporativo',
                'description' => '',
            ],
            
            // Píxeles de tracking para ecommerce
            [
                'correlative' => 'google_analytics_id',
                'name' => 'Google Analytics ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_tag_manager_id',
                'name' => 'Google Tag Manager ID',
                'description' => '',
            ],
            [
                'correlative' => 'facebook_pixel_id',
                'name' => 'Facebook Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_ads_conversion_id',
                'name' => 'Google Ads Conversion ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_ads_conversion_label',
                'name' => 'Google Ads Conversion Label',
                'description' => '',
            ],
            [
                'correlative' => 'tiktok_pixel_id',
                'name' => 'TikTok Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'hotjar_id',
                'name' => 'Hotjar ID',
                'description' => '',
            ],
            [
                'correlative' => 'clarity_id',
                'name' => 'Microsoft Clarity ID',
                'description' => '',
            ],
            [
                'correlative' => 'linkedin_insight_tag',
                'name' => 'LinkedIn Insight Tag ID',
                'description' => '',
            ],
            [
                'correlative' => 'twitter_pixel_id',
                'name' => 'Twitter Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'pinterest_tag_id',
                'name' => 'Pinterest Tag ID',
                'description' => '',
            ],
            [
                'correlative' => 'snapchat_pixel_id',
                'name' => 'Snapchat Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'custom_head_scripts',
                'name' => 'Scripts Personalizados (Head)',
                'description' => '',
            ],
            [
                'correlative' => 'custom_body_scripts',
                'name' => 'Scripts Personalizados (Body)',
                'description' => '',
            ],
        ];

        foreach ($generals as $general) {
            General::updateOrCreate(
                ['correlative' => $general['correlative']],
                $general
            );
        }
    }
}
