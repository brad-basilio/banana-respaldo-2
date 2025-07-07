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
        Schema::table('canvas_projects', function (Blueprint $table) {
            // Campos para sistema de PDF backend
      
       
            $table->json('pdf_data')->nullable()->after('pdf_generated_at');
            $table->timestamp('completed_at')->nullable()->after('pdf_data');
            
            // Agregar índices para consultas rápidas
        
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('canvas_projects', function (Blueprint $table) {
        
            $table->dropColumn(['pdf_data', 'completed_at']);
        });
    }
};
