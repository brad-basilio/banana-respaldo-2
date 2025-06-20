<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountRuleUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'discount_rule_id',
        'sale_id',
        'customer_email',
        'discount_amount',
        'applied_items'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'applied_items' => 'array'
    ];

    // Relaciones
    public function discountRule()
    {
        return $this->belongsTo(DiscountRule::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
