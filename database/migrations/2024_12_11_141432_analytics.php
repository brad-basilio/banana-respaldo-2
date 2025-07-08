<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (!Schema::hasTable('analytics_events')) {
            Schema::create('analytics_events', function (Blueprint $table) {
                $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
                $table->uuid('user_id')->nullable();
                $table->string('session_id');
                $table->string('event_type'); // pageview, product_view, cart_add, purchase
                $table->uuid('item_id')->nullable();
                $table->string('page_url');
                $table->string('source')->nullable();
                $table->string('medium')->nullable();
                $table->string('campaign')->nullable();
                $table->string('device_type');
                $table->decimal('value', 10, 2)->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
    
                $table->foreign('item_id')->references('id')->on('items')->onDelete('set null');
                $table->index(['created_at', 'event_type']);
            });
        }

        if (!Schema::hasTable('user_sessions')) { 
            Schema::create('user_sessions', function (Blueprint $table) {
                $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
                $table->uuid('user_id')->nullable();
                $table->string('session_id');
                $table->string('device_type');
                $table->string('browser');
                $table->string('os');
                $table->string('country');
                $table->string('city')->nullable();
                $table->string('referrer')->nullable();
                $table->integer('page_views')->default(0);
                $table->integer('duration')->default(0);
                $table->boolean('converted')->default(false);
                $table->timestamps();
    
                $table->index(['created_at', 'converted']);
            });
        }   

        if (!Schema::hasTable('cart_analytics')) { 
            Schema::create('cart_analytics', function (Blueprint $table) {
                $table->uuid('id')->default(DB::raw('(UUID())'))->primary();
                $table->uuid('user_id')->nullable();
                $table->string('session_id');
                $table->string('status'); // active, abandoned, completed
                $table->json('items');
                $table->decimal('total', 10, 2);
                $table->string('abandonment_stage')->nullable();
                $table->timestamp('last_activity')->nullable();
                $table->timestamps();
    
                $table->index(['created_at', 'status']);
            });
        }    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('cart_analytics');
    }
};
