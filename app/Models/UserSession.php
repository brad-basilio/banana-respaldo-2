<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
     use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'session_id',
        'device_type',
        'browser',
        'os',
        'country',
        'city',
        'ip_address',
        'user_agent',
        'referrer',
        'page_views',
        'duration',
        'converted'
    ];

    protected $casts = [
        'converted' => 'boolean',
        'page_views' => 'integer',
        'duration' => 'integer'
    ];

    // Optimización: Añadir índices para mejorar las consultas
    protected static function boot()
    {
        parent::boot();
        
        // Evitar crear registros duplicados en el mismo request
        static::creating(function ($model) {
            // Verificar si ya existe una sesión con el mismo session_id y user_id
            $existing = static::where('session_id', $model->session_id)
                ->where(function($query) use ($model) {
                    if ($model->user_id) {
                        $query->where('user_id', $model->user_id);
                    } else {
                        $query->whereNull('user_id');
                    }
                })
                ->exists();
                
            if ($existing) {
                return false; // Cancelar la creación
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope para sesiones activas
    public function scopeActive($query)
    {
        return $query->where('updated_at', '>=', now()->subHours(24));
    }

    // Scope para sesiones por dispositivo
    public function scopeByDevice($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    // Método para obtener sesiones únicas por session_id
    public static function getUniqueSessionStats()
    {
        return static::selectRaw('
            session_id,
            user_id,
            device_type,
            MAX(page_views) as total_page_views,
            MAX(duration) as max_duration,
            MIN(created_at) as session_start,
            MAX(updated_at) as last_activity
        ')
        ->groupBy('session_id', 'user_id', 'device_type')
        ->orderBy('last_activity', 'desc');
    }
}