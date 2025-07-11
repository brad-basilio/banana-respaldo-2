<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Helpers\PixelHelper;
use Illuminate\Http\Request;

class PixelTestController extends Controller
{
    public function index()
    {
        $pixelScripts = PixelHelper::getPixelScripts();
        
        return view('test.pixels', [
            'headScripts' => $pixelScripts['head'],
            'bodyScripts' => $pixelScripts['body'],
            'pixelData' => [
                'google_analytics_id' => PixelHelper::getPixelData('google_analytics_id'),
                'google_tag_manager_id' => PixelHelper::getPixelData('google_tag_manager_id'),
                'facebook_pixel_id' => PixelHelper::getPixelData('facebook_pixel_id'),
                'tiktok_pixel_id' => PixelHelper::getPixelData('tiktok_pixel_id'),
            ]
        ]);
    }
}
