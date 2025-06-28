<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para añadir campos de auto-guardado a la tabla canvas_projects
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('canvas_projects', function (Blueprint $table) {
            // Campos para el sistema de auto-guardado
            $table->timestamp('progress_saved_at')->nullable()->after('updated_at');
            $table->timestamp('manually_saved_at')->nullable()->after('progress_saved_at');
            $table->boolean('is_autosave')->default(true)->after('manually_saved_at');
            $table->boolean('is_finalized')->default(false)->after('is_autosave');
            
            // Índices para optimizar consultas
            $table->index(['progress_saved_at']);
            $table->index(['manually_saved_at']);
            $table->index(['is_finalized']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('canvas_projects', function (Blueprint $table) {
            $table->dropIndex(['progress_saved_at']);
            $table->dropIndex(['manually_saved_at']);
            $table->dropIndex(['is_finalized']);
            
            $table->dropColumn([
                'progress_saved_at',
                'manually_saved_at',
                'is_autosave',
                'is_finalized'
            ]);
        });
    }
};
