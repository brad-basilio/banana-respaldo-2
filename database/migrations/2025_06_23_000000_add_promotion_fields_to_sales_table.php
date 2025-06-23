<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Campos para promociones automáticas
            $table->json('applied_promotions')->nullable()->after('coupon_discount'); // JSON con detalles de promociones aplicadas
            $table->decimal('promotion_discount', 10, 2)->default(0)->after('applied_promotions'); // Total de descuentos por promociones automáticas
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['applied_promotions', 'promotion_discount']);
        });
    }
};
