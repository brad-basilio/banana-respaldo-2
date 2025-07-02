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
        Schema::table('tags', function (Blueprint $table) {
            $table->string('background_color')->nullable()->after('description');
            $table->string('text_color')->nullable()->after('background_color');
            $table->string('icon')->nullable()->after('text_color');
            $table->string('image')->nullable()->after('icon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn(['background_color', 'text_color', 'icon', 'image']);
        });
    }
};
