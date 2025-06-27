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
            // Solo agregamos los campos relacionados con PDF, no project_id
            $table->string('pdf_path')->nullable()->after('thumbnail');
            $table->timestamp('pdf_generated_at')->nullable()->after('pdf_path');
            $table->json('item_data')->nullable()->after('pdf_generated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('canvas_projects', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'pdf_generated_at', 'item_data']);
        });
    }
};
