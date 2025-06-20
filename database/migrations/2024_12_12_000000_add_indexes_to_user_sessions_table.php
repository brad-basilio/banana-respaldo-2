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
        Schema::table('user_sessions', function (Blueprint $table) {
            // Agregar índices para optimizar las consultas frecuentes
            $table->index('session_id', 'idx_user_sessions_session_id');
            $table->index(['session_id', 'user_id'], 'idx_user_sessions_session_user');
            $table->index('user_id', 'idx_user_sessions_user_id');
            $table->index('created_at', 'idx_user_sessions_created_at');
            $table->index('updated_at', 'idx_user_sessions_updated_at');
            
            // Índice compuesto para las consultas de cleanup
            $table->index(['session_id', 'created_at'], 'idx_user_sessions_session_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->dropIndex('idx_user_sessions_session_id');
            $table->dropIndex('idx_user_sessions_session_user');
            $table->dropIndex('idx_user_sessions_user_id');
            $table->dropIndex('idx_user_sessions_created_at');
            $table->dropIndex('idx_user_sessions_updated_at');
            $table->dropIndex('idx_user_sessions_session_created');
        });
    }
};