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
        Schema::create('canvas_projects', function (Blueprint $table) {
            $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->uuid('user_id')->nullable();
            $table->uuid('item_id')->nullable();
            $table->uuid('canvas_preset_id')->nullable();
            $table->string('name')->nullable();
            $table->json('project_data')->nullable(); // Almacena las páginas, elementos y configuraciones
            $table->enum('status', ['draft', 'completed', 'exported', 'ordered'])->default('draft');
            $table->string('thumbnail')->nullable(); // Imagen de vista previa
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canvas_projects');
    }
};
