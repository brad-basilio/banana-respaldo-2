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
        'thumbnail',
        'pdf_path',
        'pdf_generated_at',
        'item_data'
    ];

    protected $casts = [
        'project_data' => 'array',
        'item_data' => 'array',
        'pdf_generated_at' => 'datetime',
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

    /**
     * Scope para proyectos por estado
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para proyectos finalizados
     */
    public function scopeFinalized($query)
    {
        return $query->whereIn('status', ['completed', 'exported', 'ordered']);
    }

    /**
     * Scope para proyectos editables
     */
    public function scopeEditable($query)
    {
        return $query->whereIn('status', ['draft']);
    }

    /**
     * Verificar si el proyecto puede ser editado
     */
    public function isEditable()
    {
        return in_array($this->status, ['draft']);
    }

    /**
     * Verificar si el proyecto está finalizado
     */
    public function isFinalized()
    {
        return in_array($this->status, ['completed', 'exported', 'ordered']);
    }

    /**
     * Obtener la URL de la imagen de vista previa
     */
    public function getPreviewImageUrlAttribute()
    {
        if ($this->thumbnail) {
            // Si es una URL completa, devolverla tal como está
            if (filter_var($this->thumbnail, FILTER_VALIDATE_URL)) {
                return $this->thumbnail;
            }
            // Si es una ruta relativa, construir la URL completa
            return asset('storage/' . $this->thumbnail);
        }
        // Imagen por defecto
        return asset('assets/img/backgrounds/resources/default-image.png');
    }

    /**
     * Obtener estado legible
     */
    public function getStatusTextAttribute()
    {
        $statusMap = [
            'draft' => 'Borrador',
            'completed' => 'Completado',
            'exported' => 'Exportado',
            'ordered' => 'Pedido realizado'
        ];

        return $statusMap[$this->status] ?? 'Desconocido';
    }
}
