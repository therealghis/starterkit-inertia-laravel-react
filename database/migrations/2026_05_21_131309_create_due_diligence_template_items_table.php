<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('due_diligence_template_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('due_diligence_template_id')
                ->constrained('due_diligence_templates')
                ->cascadeOnDelete();
            $table->string('entity', 255);
            $table->string('topic', 255);
            $table->text('request_text');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('due_diligence_template_id');
            $table->index('sort_order');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('due_diligence_template_items');
    }
};
