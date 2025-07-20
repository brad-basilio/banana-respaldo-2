<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Tag extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'background_color',
        'text_color',
        'icon',
        'image',
        'visible',
        'status',
        'start_date',
        'end_date',
        'promotional_status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'visible' => 'boolean',
        'status' => 'boolean',
    ];

    /**
     * Boot del modelo para actualizar automáticamente el estado promocional
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($tag) {
            $tag->updatePromotionalStatus();
        });
    }

    /**
     * Actualiza el estado promocional basado en las fechas
     */
    public function updatePromotionalStatus()
    {
        $now = Carbon::now();
        
        // Si no tiene fechas de inicio y fin, es permanente
        if (!$this->start_date && !$this->end_date) {
            $this->promotional_status = 'permanent';
            return;
        }

        // Si tiene fechas, verificar si está dentro del rango
        $isActive = true;
        
        if ($this->start_date && $now->lt($this->start_date)) {
            $isActive = false; // Aún no ha comenzado
        }
        
        if ($this->end_date && $now->gt($this->end_date)) {
            $isActive = false; // Ya terminó
        }

        $this->promotional_status = $isActive ? 'active' : 'expired';
    }

    /**
     * Scope para obtener solo tags activos (permanentes o dentro del rango de fechas)
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->where('promotional_status', 'permanent')
              ->orWhere('promotional_status', 'active');
        });
    }

    /**
     * Scope para obtener solo tags promocionales (con fechas)
     */
    public function scopePromotional($query)
    {
        return $query->where(function($q) {
            $q->whereNotNull('start_date')
              ->orWhereNotNull('end_date');
        });
    }

    /**
     * Scope para obtener solo tags permanentes (sin fechas)
     */
    public function scopePermanent($query)
    {
        return $query->where('promotional_status', 'permanent');
    }

    /**
     * Scope para obtener solo tags expirados
     */
    public function scopeExpired($query)
    {
        return $query->where('promotional_status', 'expired');
    }

    /**
     * Accessor para verificar si el tag está activo
     */
    public function getIsActiveAttribute()
    {
        return in_array($this->promotional_status, ['permanent', 'active']);
    }

    /**
     * Accessor para verificar si es promocional
     */
    public function getIsPromotionalAttribute()
    {
        return $this->start_date || $this->end_date;
    }

    /**
     * Accessor para obtener el estado legible
     */
    public function getStatusLabelAttribute()
    {
        return match($this->promotional_status) {
            'permanent' => 'Permanente',
            'active' => 'Activo',
            'expired' => 'Expirado',
            default => 'Desconocido'
        };
    }

    /**
     * Accessor para obtener la clase CSS del estado
     */
    public function getStatusClassAttribute()
    {
        return match($this->promotional_status) {
            'permanent' => 'success',
            'active' => 'primary',
            'expired' => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Accessor para obtener información completa del estado promocional
     */
    public function getPromotionalInfoAttribute()
    {
        $info = [
            'status' => $this->promotional_status,
            'label' => $this->status_label,
            'is_active' => $this->is_active,
            'is_promotional' => $this->is_promotional,
        ];

        if ($this->is_promotional) {
            $info['start_date'] = $this->start_date?->format('Y-m-d H:i:s');
            $info['end_date'] = $this->end_date?->format('Y-m-d H:i:s');
            
            if ($this->promotional_status === 'active') {
                $info['time_remaining'] = $this->end_date ? 
                    Carbon::now()->diffForHumans($this->end_date, true) : null;
            }
        }

        return $info;
    }

    /**
     * Accessor para obtener el tiempo restante de una promoción
     */
    public function getTimeRemainingAttribute()
    {
        if ($this->promotional_status !== 'active' || !$this->end_date) {
            return null;
        }

        return Carbon::now()->diffForHumans($this->end_date, true);
    }
}
