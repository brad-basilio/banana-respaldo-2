<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Coupon extends Model
{
    use HasFactory, HasUuids;
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'usage_limit',
        'usage_limit_per_user',
        'used_count',
        'starts_at',
        'expires_at',
        'active',
        'applicable_categories',
        'applicable_products',
        'maximum_discount',
        'first_purchase_only'
    ];

    protected $casts = [
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'first_purchase_only' => 'boolean',
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('active', true)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now());
    }

    public function scopeAvailable($query)
    {
        return $query->valid()
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            });
    }

    // Accessors
    public function getIsValidAttribute()
    {
        return $this->active &&
            $this->starts_at <= now() &&
            $this->expires_at >= now();
    }

    public function getIsAvailableAttribute()
    {
        return $this->is_valid &&
            (is_null($this->usage_limit) || $this->used_count < $this->usage_limit);
    }

    public function getStatusAttribute()
    {
        if (!$this->active) return 'inactive';
        if ($this->starts_at > now()) return 'pending';
        if ($this->expires_at < now()) return 'expired';
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return 'exhausted';
        return 'active';
    }

    public function getFormattedValueAttribute()
    {
        return $this->type === 'percentage'
            ? $this->value . '%'
            : 'S/. ' . number_format($this->value, 2);
    }

    // Methods
    public function canBeUsedBy($userId, $cartTotal = 0, $categoryIds = [], $productIds = [])
    {
        // Verificar si el cupón está disponible
        if (!$this->is_available) {
            return ['valid' => false, 'message' => 'El cupón no está disponible.'];
        }

        // Verificar monto mínimo
        if ($cartTotal < $this->minimum_amount) {
            return [
                'valid' => false,
                'message' => "El monto mínimo para usar este cupón es S/. " . number_format($this->minimum_amount, 2)
            ];
        }

        // Verificar límite por usuario (requiere implementar la tabla de usos)
        // Por ahora lo dejamos como válido

        // Verificar categorías aplicables
        if (!empty($this->applicable_categories) && !empty($categoryIds)) {
            $hasValidCategory = array_intersect($this->applicable_categories, $categoryIds);
            if (empty($hasValidCategory)) {
                return ['valid' => false, 'message' => 'Este cupón no es aplicable a los productos en tu carrito.'];
            }
        }

        // Verificar productos aplicables
        if (!empty($this->applicable_products) && !empty($productIds)) {
            $hasValidProduct = array_intersect($this->applicable_products, $productIds);
            if (empty($hasValidProduct)) {
                return ['valid' => false, 'message' => 'Este cupón no es aplicable a los productos en tu carrito.'];
            }
        }

        return ['valid' => true, 'message' => 'Cupón válido.'];
    }

    public function calculateDiscount($amount)
    {
        $discount = 0;

        if ($this->type === 'percentage') {
            $discount = ($amount * $this->value) / 100;
            // Aplicar descuento máximo si está definido
            if ($this->maximum_discount && $discount > $this->maximum_discount) {
                $discount = $this->maximum_discount;
            }
        } else {
            $discount = min($this->value, $amount); // No puede ser mayor al total
        }

        return round($discount, 2);
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }

    // Relaciones (para futuras implementaciones)
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'coupon_categories');
    }

    public function products()
    {
        return $this->belongsToMany(Item::class, 'coupon_products');
    }
}
