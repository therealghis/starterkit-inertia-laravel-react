<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function getConnection(): ?string {
        return config('trivy.database.connection');
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
            $table->unsignedInteger('critical_count')->default(0);
            $table->unsignedInteger('high_count')->default(0);
            $table->unsignedInteger('medium_count')->default(0);
            $table->unsignedInteger('low_count')->default(0);
            $table->unsignedInteger('unknown_count')->default(0);
            $table->unsignedInteger('new_count')->default(0);
            $table->unsignedInteger('fixed_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        $schema->create('security_findings', function (Blueprint $table) {
            $table->id();
            $table->string('fingerprint')->unique();
            $table->string('vulnerability_id')->nullable()->index();
            $table->string('pkg_name')->index();
            $table->string('installed_version')->nullable();
            $table->string('fixed_version')->nullable();
            $table->string('severity', 32)->index();
            $table->string('severity_source', 64)->nullable();
            $table->string('title')->nullable();
            $table->text('primary_url')->nullable();
            $table->string('target')->nullable()->index();
            $table->string('class', 64)->nullable()->index();
            $table->string('type', 64)->nullable()->index();
            $table->string('status', 32)->default('open')->index();
            $table->timestamp('first_seen_at')->nullable()->index();
            $table->timestamp('last_seen_at')->nullable()->index();
            $table->foreignId('first_seen_scan_id')->nullable()->constrained('security_scans');
            $table->foreignId('last_seen_scan_id')->nullable()->constrained('security_scans');
            $table->timestamps();

            $table->index(['pkg_name', 'installed_version']);
            $table->index(['severity', 'status']);
        });

        $schema->create('security_finding_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('security_finding_id')->constrained('security_findings')->cascadeOnDelete();
            $table->foreignId('security_scan_id')->constrained('security_scans')->cascadeOnDelete();
            $table->string('event_type', 32)->index();
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['security_finding_id', 'event_type']);
        });
    }

    public function down(): void {
        $schema = Schema::connection($this->getConnection());

        $schema->dropIfExists('security_finding_events');
        $schema->dropIfExists('security_findings');
        $schema->dropIfExists('security_scans');
    }
};
