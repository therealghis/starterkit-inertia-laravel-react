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

        $schema->create('merge_acquisition_economic_activity', function (Blueprint $table) {
            $table->increments('merge_acquisition_economic_activity_id');
            $table->text('activity_name');
            $table->boolean('active')->default(true);
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition', function (Blueprint $table) {
            $table->increments('merge_acquisition_id');
            $table->foreignId('person_id')->constrained(table: 'users')->restrictOnDelete()->noActionOnUpdate();
            $table->unsignedInteger('merge_acquisition_economic_activity_id')->nullable()->index();
            $table->string('identification_code');
            $table->string('intent_type');
            $table->string('company_name')->nullable();
            $table->text('company_description')->nullable();
            $table->text('product')->nullable();
            $table->string('legal_entity')->nullable();
            $table->string('establishment_date')->nullable();
            $table->text('ateco_code')->nullable();
            $table->string('nominal_capital')->nullable();
            $table->string('headquarters_legal_province')->nullable();
            $table->string('headquarters_legal_country')->nullable();
            $table->string('headquarters_operative_province')->nullable();
            $table->string('headquarters_operative_country')->nullable();
            $table->integer('total_employees')->nullable();
            $table->string('selling_type')->nullable();
            $table->text('selling_reason')->nullable();
            $table->boolean('real_estate')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition_audit', function (Blueprint $table) {
            $table->increments('merge_acquisition_audit_id');
            $table->unsignedInteger('merge_acquisition_id')->index();
            $table->string('action');
            $table->longText('audit_description')->nullable();
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition_attachment', function (Blueprint $table) {
            $table->increments('merge_acquisition_attachment_id');
            $table->unsignedInteger('merge_acquisition_id')->index();
            $table->unsignedInteger('mimetype_extension_id')->index();
            $table->text('file_path');
            $table->string('filename');
            $table->boolean('active')->default(true);
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition_financial', function (Blueprint $table) {
            $table->increments('merge_acquisition_financial_id');
            $table->unsignedInteger('merge_acquisition_id')->index();
            $table->integer('year');
            $table->string('sales');
            $table->string('income');
            $table->string('pfn');
            $table->string('ebitda');
            $table->string('debt')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition_favorite_person', function (Blueprint $table) {
            $table->increments('merge_acquisition_favorite_person_id');
            $table->unsignedInteger('merge_acquisition_id')->index();
            $table->foreignId('person_id')->constrained(table: 'users')->restrictOnDelete()->noActionOnUpdate();
            $table->boolean('active')->default(true);
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });

        $schema->create('merge_acquisition_contact_request', function (Blueprint $table) {
            $table->increments('merge_acquisition_contact_request_id');
            $table->unsignedInteger('merge_acquisition_id')->index();
            $table->unsignedInteger('email_id')->nullable()->index();
            $table->string('requester_name');
            $table->string('requester_surname');
            $table->string('requester_email');
            $table->string('requester_phone');
            $table->timestamp('date_updated')->nullable();
            $table->foreignId('person_id_updated')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
            $table->timestamp('date_created')->nullable();
            $table->foreignId('person_id_created')->nullable()->constrained(table: 'users')->nullOnDelete()->noActionOnUpdate();
        });
    }

    public function down(): void {
        $schema = Schema::connection($this->getConnection());

        $schema->dropIfExists('merge_acquisition_contact_request');
        $schema->dropIfExists('merge_acquisition_favorite_person');
        $schema->dropIfExists('merge_acquisition_financial');
        $schema->dropIfExists('merge_acquisition_attachment');
        $schema->dropIfExists('merge_acquisition_audit');
        $schema->dropIfExists('merge_acquisition');
        $schema->dropIfExists('merge_acquisition_economic_activity');
    }
};
