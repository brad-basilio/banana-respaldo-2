<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('discount_rule_usages', function (Blueprint $table) {
            $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
            $table->uuid('discount_rule_id')->nullable();
            $table->uuid('sale_id')->nullable(); // ID de la venta asociada
            $table->string('customer_email')->nullable();
            $table->decimal('discount_amount', 10, 2); // Monto descontado
            $table->json('applied_items')->nullable(); // Items a los que se aplicó
            $table->timestamps();
            
            
        });
    }

    public function down()
    {
        Schema::dropIfExists('discount_rule_usages');
    }
};
