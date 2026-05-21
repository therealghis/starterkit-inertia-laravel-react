<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('due_diligences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(
                    table: 'merge_acquisition',
                    indexName: 'due_diligences_merge_acquisition_id_index',
                )
                ->cascadeOnDelete();
            $table->foreignId('due_diligence_template_id')
                ->nullable()
                ->constrained(
                    table: 'due_diligence_templates',
                    indexName: 'due_diligences_due_diligence_template_id_index',
                )
                ->nullOnDelete();
            $table->string('title', 255);
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('status', 50)->default('open');
            $table->text('company_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('created_by_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('year');
            $table->index('status');
            $table->index(['merge_acquisition_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('due_diligences');
    }
};
