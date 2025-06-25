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
        Schema::create('canvas_presets', function (Blueprint $table) {
             $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('width', 8, 2); // en cm
            $table->decimal('height', 8, 2); // en cm
            $table->integer('dpi')->default(300);
            $table->integer('pages')->default(1);
            $table->string('background_color', 20)->default('#FFFFFF');
            $table->string('type'); // photobook, canvas, calendar, mug, photo, other
            $table->boolean('active')->default(true);
            $table->string('status')->default(true); 
            $table->json('extra_settings')->nullable(); // Para configuraciones adicionales
            $table->timestamps();
           
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canvas_presets');
    }
};
