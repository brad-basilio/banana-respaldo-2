<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CanvasProject extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'canvas_projects';

    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'user_id',
        'item_id',
        'canvas_preset_id',
        'project_data',
        'status',
        'name',
        'thumbnail'
    ];

    protected $casts = [
        'project_data' => 'array',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function canvasPreset()
    {
        return $this->belongsTo(CanvasPreset::class);
    }

    // Estados disponibles
    public static function getStatuses()
    {
        return [
            'draft' => 'Borrador',
            'completed' => 'Completado',
            'exported' => 'Exportado',
            'ordered' => 'Pedido realizado',
        ];
    }
}
