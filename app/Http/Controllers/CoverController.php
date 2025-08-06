<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use SoDe\Extend\Crypto;
use SoDe\Extend\Response;

class CoverController extends Controller
{
    public function thumbnail(Request $request, $uuid)
    {
        try {
            $content = Storage::get('cover/thumbnail/' . $uuid . '.img');
            if (!$content) throw new Exception('Perfil no encontrado');
            return response($content, 200, [
                'Content-Type' => 'application/octet-stream'
            ]);
        } catch (\Throwable $th) {
            $content = Storage::get('utils/cover-404.svg');
            return response($content, 200, [
                'Content-Type' => 'image/svg+xml'
            ]);
        }
    }

    public function full(Request $request, $uuid)
    {
        try {
            $content = Storage::get('cover/' . $uuid . '.img');
            if (!$content) throw new Exception('Perfil no encontrado');
            return response($content, 200, [
                'Content-Type' => 'application/octet-stream'
            ]);
        } catch (\Throwable $th) {
            $content = Storage::get('utils/cover-404.svg');
            return response($content, 200, [
                'Content-Type' => 'image/svg+xml'
            ]);
        }
    }

    public function saveCover(Request $request)
    {
        $response = Response::simpleTryCatch(function (Response $response) use ($request) {
            $userId = Auth::user()->id;
            $userJpa = User::find($userId);
            if (!$userJpa->uuid) {
                $userJpa->uuid = Crypto::randomUUID();
                $userJpa->save();
            }

            $thumbnail = $request->file('thumbnail');
            $full = $request->file('full');

            $thumbnailPath = 'cover/thumbnail/' . $userJpa->uuid . '.img';
            $fullPath = 'cover/' . $userJpa->uuid . '.img';

            Storage::put($thumbnailPath, file_get_contents($thumbnail));
            Storage::put($fullPath, file_get_contents($full));
            
            // ✅ FIJO: Establecer permisos 777
            $thumbnailFullPath = storage_path('app/' . $thumbnailPath);
            if (file_exists($thumbnailFullPath)) {
                chmod($thumbnailFullPath, 0777);
            }
            
            $fullFullPath = storage_path('app/' . $fullPath);
            if (file_exists($fullFullPath)) {
                chmod($fullFullPath, 0777);
            }

            $response->data = [
                'uuid' => $userJpa->uuid
            ];
        });

        return response($response->toArray(), $response->status);
    }
}
