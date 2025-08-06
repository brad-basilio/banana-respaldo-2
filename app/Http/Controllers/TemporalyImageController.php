<?php

namespace App\Http\Controllers;

use App\Models\TemporalyImage;
use App\Http\Requests\StoreTemporalyImageRequest;
use App\Http\Requests\UpdateTemporalyImageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use SoDe\Extend\Crypto;

class TemporalyImageController extends BasicController
{   
    public $model = TemporalyImage::class;
    public $imageFields = ['filename'];
    

    public function storeTemp(Request $request)
    {   
      
        try {

            $request->validate([
                'voucher' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5120'
            ]); 

            $full = $request->file("voucher");
            $uuid = Crypto::randomUUID();
            $ext = $full->getClientOriginalExtension();
            $path = "images/temporaly_image/{$uuid}.{$ext}";
            Storage::put($path, file_get_contents($full));
            
            // ✅ FIJO: Establecer permisos 777
            $fullPath = storage_path('app/' . $path);
            if (file_exists($fullPath)) {
                chmod($fullPath, 0777);
            }
            
            $temp = TemporalyImage::create(['filename' => "{$uuid}.{$ext}"]);

            return response()->json(['id' => $temp->id]);

        } catch (\Throwable $th) {
            //throw $th;
        }

        
    }

    public function deleteTemp(Request $request, $id)
    {      
       
          try {
            $temp = TemporalyImage::where('id', $id)->first();
            $path = "images/temporaly_image/{$temp->filename}";
            Storage::delete($path);
            $temp->delete();

            return response()->json(['success' => true]);
          } catch (\Throwable $th) {
           
          }
    }

    public function guardarVoucher(Request $request)
    {
        $request->validate([
            'files' => 'required|array'
        ]);

        foreach ($request->files as $fileId) {
            $newPath = str_replace('tmp_vouchers/', 'vouchers/', $fileId);
            Storage::disk('local')->move($fileId, $newPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Voucher(s) guardado(s) correctamente'
        ]);
    }

}
