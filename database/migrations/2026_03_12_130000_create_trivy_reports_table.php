<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function getConnection(): ?string {
        return config('database.default');
    }

    public function up(): void {
        $schema = Schema::connection($this->getConnection());

        $schema->create('security_scans', function (Blueprint $table) {
            $table->id();
            $table->uuid('scan_key')->unique();
            $table->string('status', 32)->index();
            $table->string('scan_mode', 64)->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('finished_at')->nullable();
            $table->json('raw_report_paths')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        $schema = Schema::connection($this->getConnection());

        $schema->dropIfExists('security_scans');
    }
};
