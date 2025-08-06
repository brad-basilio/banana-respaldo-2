<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use SoDe\Extend\Crypto;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {


        if ($request->hasFile('file')) {
            $full = $request->file('file');
            $uuid = Crypto::randomUUID();
            $ext = $full->getClientOriginalExtension();
            $path = "images/image_emails/{$uuid}.{$ext}";
            Storage::put($path, file_get_contents($full));
            
            // ✅ FIJO: Establecer permisos 777
            $fullPath = storage_path('app/' . $path);
            if (file_exists($fullPath)) {
                chmod($fullPath, 0777);
            }

            $url_de_la_imagen = url(Storage::url($path)); // Esto genera la URL absoluta
            return response()->json(['location' => $url_de_la_imagen]);
        }
        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
