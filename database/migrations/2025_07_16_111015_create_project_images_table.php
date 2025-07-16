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
        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('filename'); // Nombre original del archivo
            $table->string('path'); // Ruta de la imagen principal
            $table->string('thumbnail_path'); // Ruta de la miniatura
            $table->string('url'); // URL pública de la imagen principal
            $table->string('thumbnail_url'); // URL pública de la miniatura
            $table->bigInteger('size')->nullable(); // Tamaño en bytes
            $table->string('mime_type')->nullable(); // Tipo MIME
            $table->integer('width')->nullable(); // Ancho original
            $table->integer('height')->nullable(); // Alto original
            $table->integer('thumbnail_width')->default(150); // Ancho de miniatura
            $table->integer('thumbnail_height')->default(150); // Alto de miniatura
            $table->timestamps();
            
            $table->index(['project_id', 'created_at']);
            $table->index('filename');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_images');
    }
};
