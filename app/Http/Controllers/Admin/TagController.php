<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends BasicController
{
    public $model = Tag::class;
    public $reactView = 'Admin/Tags';
    public $imageFields = ['image','icon'];

    /**
     * Actualiza el estado promocional de todos los tags
     */
    public function updatePromotionalStatus(Request $request)
    {
        try {
            $tags = Tag::all();
            $updated = 0;
            $stats = [
                'permanent' => 0,
                'active' => 0,
                'expired' => 0,
            ];

            foreach ($tags as $tag) {
                $oldStatus = $tag->promotional_status;
                $tag->updatePromotionalStatus();
                
                if ($oldStatus !== $tag->promotional_status) {
                    $tag->save();
                    $updated++;
                }
                
                $stats[$tag->promotional_status]++;
            }

            return response()->json([
                'success' => true,
                'message' => 'Estados promocionales actualizados correctamente',
                'data' => [
                    'updated' => $updated,
                    'total' => $tags->count(),
                    ...$stats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estados: ' . $e->getMessage()
            ], 500);
        }
    }
}
