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
        Schema::table('tags', function (Blueprint $table) {
            $table->datetime('start_date')->nullable()->after('image')->comment('Fecha de inicio de la promoción. Si es null, la etiqueta es permanente');
            $table->datetime('end_date')->nullable()->after('start_date')->comment('Fecha de fin de la promoción. Si es null, la etiqueta es permanente');
            $table->enum('promotional_status', ['permanent', 'active', 'expired'])->default('permanent')->after('end_date')->comment('Estado de la promoción: permanent=sin fechas, active=dentro del rango, expired=fuera del rango');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'promotional_status']);
        });
    }
};
