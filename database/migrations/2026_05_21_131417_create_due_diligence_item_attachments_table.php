<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('due_diligence_item_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('due_diligence_item_id')
                ->constrained(
                    table: 'due_diligence_items',
                    indexName: 'due_diligence_item_attachments_due_diligence_item_id_index',
                )
                ->cascadeOnDelete();
            $table->foreignId('uploaded_by_id')
                ->nullable()
                ->constrained(
                    table: 'users',
                    indexName: 'due_diligence_item_attachments_uploaded_by_id_index',
                )
                ->nullOnDelete();
            $table->string('filename', 255);
            $table->string('mimetype', 255);
            $table->string('file_path', 1024);
            $table->string('disk', 50)->default('local');
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('mimetype');
            $table->index(['due_diligence_item_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('due_diligence_item_attachments');
    }
};
