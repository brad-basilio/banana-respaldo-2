<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {   
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'coupon_id')) {
                $table->dropForeign(['coupon_id']);
                $table->dropColumn('coupon_id');
            }
        });

        // Eliminar la tabla si existe
        Schema::dropIfExists('coupons');
        
        // Crear la tabla
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->string('code')->nullable(); // Código del cupón
            $table->string('name')->nullable(); // Nombre descriptivo del cupón
            $table->text('description')->nullable(); // Descripción del cupón
            $table->enum('type', ['percentage', 'fixed'])->default('fixed'); // Tipo: porcentaje o monto fijo
            $table->decimal('value', 10, 2)->nullable(); // Valor del descuento
            $table->decimal('minimum_amount', 10, 2)->default(0); // Monto mínimo de compra
            $table->integer('usage_limit')->nullable(); // Límite de usos (null = ilimitado)
            $table->integer('usage_limit_per_user')->default(1); // Límite de usos por usuario
            $table->integer('used_count')->default(0); // Veces que se ha usado
            $table->datetime('starts_at')->nullable(); // Fecha de inicio
            $table->datetime('expires_at')->nullable(); // Fecha de expiración
            $table->boolean('active')->default(true); // Estado activo/inactivo
            $table->json('applicable_categories')->nullable(); // Categorías aplicables (JSON)
            $table->json('applicable_products')->nullable(); // Productos aplicables (JSON)
            $table->decimal('maximum_discount', 10, 2)->nullable(); // Descuento máximo (para porcentajes)
            $table->boolean('first_purchase_only')->default(false); // Solo primera compra

            $table->boolean('status')->nullable()->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};