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
            // Verificar si las columnas ya existen antes de agregarlas
            if (!Schema::hasColumn('canvas_projects', 'pdf_path')) {
                $table->string('pdf_path')->nullable()->after('thumbnail');
            }
            
            if (!Schema::hasColumn('canvas_projects', 'pdf_generated_at')) {
                $table->timestamp('pdf_generated_at')->nullable()->after('pdf_path');
            }
            
            if (!Schema::hasColumn('canvas_projects', 'pdf_data')) {
                $table->json('pdf_data')->nullable()->after('pdf_generated_at');
            }
            
            if (!Schema::hasColumn('canvas_projects', 'design_data')) {
                $table->json('design_data')->nullable()->after('project_data');
            }
            
            if (!Schema::hasColumn('canvas_projects', 'configuration')) {
                $table->text('configuration')->nullable()->after('design_data');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('canvas_projects', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'pdf_generated_at', 'pdf_data', 'design_data', 'configuration']);
        });
    }
};
