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
        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->string('name')->nullable(); // Nombre de la tienda
            $table->text('address')->nullable(); // Dirección completa
            $table->string('phone')->nullable(); // Teléfono
            $table->string('email')->nullable(); // Email
            $table->text('description')->nullable(); // Descripción
            $table->string('ubigeo', 10)->nullable(); // Código de ubigeo
            $table->decimal('latitude', 10, 8)->nullable(); // Latitud para Google Maps
            $table->decimal('longitude', 11, 8)->nullable(); // Longitud para Google Maps
            $table->string('image')->nullable(); // Imagen de la tienda
            $table->boolean('status')->default(true); // Estado activo/inactivo
            $table->boolean('visible')->default(true); // Visibilidad en la web
            $table->json('business_hours')->nullable(); // Horarios de atención
            $table->string('manager')->nullable(); // Encargado
            $table->integer('capacity')->nullable(); // Capacidad de atención
            $table->string('slug', 100)->unique();
            $table->json('gallery')->nullable();
            $table->timestamps();
          
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
