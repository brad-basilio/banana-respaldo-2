<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('discount_rules', function (Blueprint $table) {
            $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->string('name')->nullable(); // Nombre de la regla
            $table->text('description')->nullable(); // Descripción
            $table->boolean('active')->default(true); // Si está activa
            $table->integer('priority')->default(0); // Prioridad de aplicación
            
            // Fechas de vigencia
            $table->datetime('starts_at')->nullable();
            $table->datetime('ends_at')->nullable();
            
            // Límites de uso
            $table->integer('usage_limit')->nullable(); // Límite total de usos
            $table->integer('usage_limit_per_customer')->nullable(); // Límite por cliente
            $table->integer('used_count')->default(0); // Contador de usos
            
            // Tipo de regla
            $table->enum('rule_type', [
                'quantity_discount',     // Descuento por cantidad (2x1, 3x2)
                'tiered_discount',       // Descuento escalonado (compra 5 lleva 6)
                'category_discount',     // Descuento por categoría
                'cart_discount',         // Descuento por total del carrito
                'buy_x_get_y',          // Compra X lleva Y gratis
                'bundle_discount'        // Descuento por paquete/combo
            ])->default('quantity_discount');
            
            // Condiciones (JSON)
            $table->json('conditions')->nullable(); // Condiciones para que se aplique la regla
            /*
            Ejemplos de conditions:
            {
                "min_quantity": 2,
                "products": [1, 2, 3],
                "categories": [1, 2],
                "min_amount": 100,
                "customer_groups": ["regular", "premium"]
            }
            */
            
            // Acciones (JSON)
            $table->json('actions')->nullable(); // Qué descuento aplicar
            /*
            Ejemplos de actions:
            {
                "discount_type": "percentage", // percentage, fixed, free_shipping, free_product
                "discount_value": 20,
                "apply_to": "cheapest", // cheapest, most_expensive, all, specific
                "free_product_id": 5,
                "max_discount": 50
            }
            */
            
            // Configuración adicional
            $table->boolean('combinable')->default(false); // Si se puede combinar con otras reglas
            $table->boolean('stop_further_rules')->default(false); // Si para la evaluación de otras reglas
            
            $table->timestamps();
            
        });
    }

    public function down()
    {
        Schema::dropIfExists('discount_rules');
    }
};
