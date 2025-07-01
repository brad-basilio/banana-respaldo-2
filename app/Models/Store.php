<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Store extends Model
{
    use HasFactory, HasUuids;
 public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'description',
        'ubigeo',
        'latitude',
        'longitude',
        'image',
        'status',
        'visible',
        'business_hours',
        'manager',
        'capacity'
    ];

    protected $casts = [
        'status' => 'boolean',
        'business_hours' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'capacity' => 'integer'
    ];

    // Scope para tiendas activas
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // Scope para filtrar por ubigeo
    public function scopeByUbigeo($query, $ubigeo)
    {
        return $query->where('ubigeo', $ubigeo);
    }

    // Accessor para obtener la URL completa de la imagen
    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        return asset('storage/images/stores/' . $this->image);
    }

    // Método para verificar si la tienda está abierta
    public function isOpenNow()
    {
        if (!$this->status || !$this->business_hours) return false;

        $now = now();
        $today = $now->format('l'); // Nombre del día en inglés
        $currentTime = $now->format('H:i');

        // Mapeo de días inglés a español
        $dayMapping = [
            'Monday' => 'Lunes',
            'Tuesday' => 'Martes',
            'Wednesday' => 'Miércoles',
            'Thursday' => 'Jueves',
            'Friday' => 'Viernes',
            'Saturday' => 'Sábado',
            'Sunday' => 'Domingo'
        ];

        $todaySpanish = $dayMapping[$today] ?? $today;

        foreach ($this->business_hours as $schedule) {
            if ($schedule['day'] === $todaySpanish) {
                if ($schedule['closed']) return false;
                
                return $currentTime >= $schedule['open'] && $currentTime <= $schedule['close'];
            }
        }

        return false;
    }

    // Método para obtener los horarios de hoy
    public function getTodaySchedule()
    {
        if (!$this->business_hours) return null;

        $today = now()->format('l');
        $dayMapping = [
            'Monday' => 'Lunes',
            'Tuesday' => 'Martes',
            'Wednesday' => 'Miércoles',
            'Thursday' => 'Jueves',
            'Friday' => 'Viernes',
            'Saturday' => 'Sábado',
            'Sunday' => 'Domingo'
        ];

        $todaySpanish = $dayMapping[$today] ?? $today;

        foreach ($this->business_hours as $schedule) {
            if ($schedule['day'] === $todaySpanish) {
                return $schedule;
            }
        }

        return null;
    }

    // Método para obtener información de ubicación
    public function getLocationInfo()
    {
        if (!$this->ubigeo) return null;

        $ubigeoData = collect(config('app.ubigeo'))
            ->firstWhere('reniec', $this->ubigeo);

        return $ubigeoData ? [
            'distrito' => $ubigeoData['distrito'],
            'provincia' => $ubigeoData['provincia'],
            'departamento' => $ubigeoData['departamento']
        ] : null;
    }

    // Accessor para obtener el distrito
    public function getDistrictAttribute()
    {
        $location = $this->getLocationInfo();
        return $location ? $location['distrito'] : null;
    }

    // Accessor para obtener la provincia
    public function getProvinceAttribute()
    {
        $location = $this->getLocationInfo();
        return $location ? $location['provincia'] : null;
    }

    // Accessor para obtener el departamento  
    public function getDepartmentAttribute()
    {
        $location = $this->getLocationInfo();
        return $location ? $location['departamento'] : null;
    }

    // Accessor para obtener horario formateado
    public function getScheduleAttribute()
    {
        $schedule = $this->getTodaySchedule();
        if (!$schedule) return 'Horario no disponible';
        
        if ($schedule['closed']) return 'Cerrado hoy';
        
        return "Hoy: {$schedule['open']} - {$schedule['close']}";
    }
}
