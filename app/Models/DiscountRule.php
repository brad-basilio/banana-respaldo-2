<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DiscountRule extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'name',
        'description',
        'active',
        'priority',
        'starts_at',
        'ends_at',
        'usage_limit',
        'usage_limit_per_customer',
        'used_count',
        'rule_type',
        'conditions',
        'actions',
        'combinable',
        'stop_further_rules'
    ];

    protected $casts = [
        'active' => 'boolean',
        'combinable' => 'boolean',
        'stop_further_rules' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'conditions' => 'array',
        'actions' => 'array',
        'priority' => 'integer',
        'usage_limit' => 'integer',
        'usage_limit_per_customer' => 'integer',
        'used_count' => 'integer'
    ];

    // Relaciones
    public function usages()
    {
        return $this->hasMany(DiscountRuleUsage::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->where('active', true)
            ->where(function ($q) use ($now) {
                $q->where('starts_at', '<=', $now)
                    ->orWhereNull('starts_at');
            })
            ->where(function ($q) use ($now) {
                $q->where('ends_at', '>=', $now)
                    ->orWhereNull('ends_at');
            });
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('created_at', 'asc');
    }

    // Métodos auxiliares
    public function isValid()
    {
        if (!$this->active) return false;

        $now = Carbon::now();

        if ($this->starts_at && $this->starts_at > $now) return false;
        if ($this->ends_at && $this->ends_at < $now) return false;

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;

        return true;
    }

    public function canBeUsedByCustomer($customerEmail)
    {
        if (!$this->usage_limit_per_customer) return true;

        $customerUsages = $this->usages()
            ->where('customer_email', $customerEmail)
            ->count();

        return $customerUsages < $this->usage_limit_per_customer;
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }

    public function getStatusAttribute()
    {
        if (!$this->active) return 'Inactiva';

        $now = Carbon::now();

        if ($this->starts_at && $this->starts_at > $now) return 'Programada';
        if ($this->ends_at && $this->ends_at < $now) return 'Expirada';
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return 'Agotada';

        return 'Activa';
    }

    public function getTypeNameAttribute()
    {
        $types = [
            'quantity_discount' => 'Descuento por Cantidad',
            'tiered_discount' => 'Descuento Escalonado',
            'category_discount' => 'Descuento por Categoría',
            'cart_discount' => 'Descuento por Carrito',
            'buy_x_get_y' => 'Compra X Lleva Y',
            'bundle_discount' => 'Descuento por Paquete'
        ];

        return $types[$this->rule_type] ?? $this->rule_type;
    }

    // Método para obtener descripción legible de la regla
    public function getReadableDescription()
    {
        $conditions = $this->conditions;
        $actions = $this->actions;

        $description = "";

        // Construir descripción basada en el tipo
        switch ($this->rule_type) {
            case 'quantity_discount':
                if (isset($conditions['min_quantity'])) {
                    $description = "Compra {$conditions['min_quantity']} o más";
                    if (isset($actions['discount_type']) && $actions['discount_type'] === 'percentage') {
                        $description .= " y obtén {$actions['discount_value']}% de descuento";
                    }
                }
                break;

            case 'buy_x_get_y':
                if (isset($conditions['buy_quantity']) && isset($actions['get_quantity'])) {
                    $description = "Compra {$conditions['buy_quantity']} y lleva {$actions['get_quantity']}";
                }
                break;

            case 'cart_discount':
                if (isset($conditions['min_amount'])) {
                    $description = "Compras desde S/ {$conditions['min_amount']}";
                    if (isset($actions['discount_value'])) {
                        $type = $actions['discount_type'] === 'percentage' ? '%' : ' soles';
                        $description .= " = {$actions['discount_value']}{$type} de descuento";
                    }
                }
                break;
        }

        return $description ?: $this->description;
    }
}
