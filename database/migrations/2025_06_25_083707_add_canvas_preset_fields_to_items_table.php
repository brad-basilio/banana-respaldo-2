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
        Schema::table('items', function (Blueprint $table) {
            $table->uuid('canvas_preset_id')->nullable()->after('brand_id');
            $table->integer('pages')->default(1)->after('canvas_preset_id');
            $table->string('cover_image')->nullable()->after('texture');
            $table->string('content_image')->nullable()->after('cover_image');
            $table->string('back_cover_image')->nullable()->after('content_image');
            
            // Add foreign key constraint
            $table->foreign('canvas_preset_id')->references('id')->on('canvas_presets')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['canvas_preset_id']);
            $table->dropColumn([
                'canvas_preset_id',
                'pages',
                'cover_image',
                'content_image',
                'back_cover_image'
            ]);
        });
    }
};
