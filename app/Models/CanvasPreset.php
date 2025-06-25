<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CanvasPreset extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'canvas_presets';

    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'name',
        'description',
        'width',
        'height',
        'dpi',
        'pages',
        'background_color',
        'type',
        'status',
        'visible',
        'extra_settings'
    ];

    protected $casts = [
        'width' => 'float',
        'height' => 'float',
        'dpi' => 'integer',
        'pages' => 'integer',
     
        'extra_settings' => 'array',
    ];

    // Tipos de preset disponibles
    public static function getTypes()
    {
        return [
            'photobook' => 'Photobook',
            'canvas' => 'Lienzo',
            'calendar' => 'Calendario',
            'mug' => 'Taza',
            'photo' => 'Fotografía',
            'other' => 'Otro',
        ];
    }

    // Relación con items (opcional, si deseas relacionar los presets con los productos)
    public function items()
    {
        return $this->hasMany(Item::class, 'canvas_preset_id');
    }
}
