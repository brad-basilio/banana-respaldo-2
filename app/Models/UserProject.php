<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'design_data',
        'preview_image',
        'template_id',
        'status',
        'settings'
    ];

    protected $casts = [
        'design_data' => 'array',
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'draft'
    ];

    /**
     * Relación con el usuario propietario del proyecto
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el template base (si aplica)
     */
    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Scope para proyectos activos (no eliminados)
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
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
        return $query->whereIn('status', ['finalizado', 'completed']);
    }

    /**
     * Scope para proyectos editables
     */
    public function scopeEditable($query)
    {
        return $query->whereNotIn('status', ['finalizado', 'completed']);
    }

    /**
     * Verificar si el proyecto puede ser editado
     */
    public function isEditable()
    {
        return !in_array($this->status, ['finalizado', 'completed']);
    }

    /**
     * Verificar si el proyecto está finalizado
     */
    public function isFinalized()
    {
        return in_array($this->status, ['finalizado', 'completed']);
    }

    /**
     * Obtener la URL de la imagen de vista previa
     */
    public function getPreviewImageUrlAttribute()
    {
        if ($this->preview_image) {
            // Si es una URL completa, devolverla tal como está
            if (filter_var($this->preview_image, FILTER_VALIDATE_URL)) {
                return $this->preview_image;
            }
            // Si es una ruta relativa, construir la URL completa
            return asset('storage/' . $this->preview_image);
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
            'en_progreso' => 'En progreso',
            'finalizado' => 'Finalizado',
            'completed' => 'Completado'
        ];

        return $statusMap[$this->status] ?? 'Desconocido';
    }
}
