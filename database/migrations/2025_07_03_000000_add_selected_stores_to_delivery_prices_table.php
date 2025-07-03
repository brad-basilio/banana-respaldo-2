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
        Schema::table('delivery_prices', function (Blueprint $table) {
            $table->json('selected_stores')->nullable()->after('is_store_pickup')
                  ->comment('IDs de tiendas específicas donde está disponible el retiro. NULL = todas las tiendas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_prices', function (Blueprint $table) {
            $table->dropColumn('selected_stores');
        });
    }
};
