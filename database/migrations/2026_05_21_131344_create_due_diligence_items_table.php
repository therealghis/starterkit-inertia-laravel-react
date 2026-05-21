<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('due_diligence_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('due_diligence_id')
                ->constrained(
                    table: 'due_diligences',
                    indexName: 'due_diligence_items_due_diligence_id_index',
                )
                ->cascadeOnDelete();
            $table->foreignId('due_diligence_template_item_id')
                ->nullable()
                ->constrained(
                    table: 'due_diligence_template_items',
                    indexName: 'due_diligence_items_due_diligence_template_item_id_index',
                )
                ->nullOnDelete();
            $table->string('entity', 255);
            $table->string('topic', 255);
            $table->text('request_text');
            $table->string('status', 50)->default('open');
            $table->text('company_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->boolean('is_custom')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('is_custom');
            $table->index(['due_diligence_id', 'sort_order']);
            $table->index(['due_diligence_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('due_diligence_items');
    }
};
