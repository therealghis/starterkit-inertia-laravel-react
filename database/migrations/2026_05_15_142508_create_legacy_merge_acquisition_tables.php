<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void {
        Schema::create('merge_acquisition_economic_activity', function (Blueprint $table) {
            $table->id();
            $table->text('activity_name');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('merge_acquisition', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained(table: 'users')->restrictOnDelete()->noActionOnUpdate();
            $table->foreignId('merge_acquisition_economic_activity_id')
                ->nullable()
                ->constrained(table: 'merge_acquisition_economic_activity')
                ->nullOnDelete()
                ->noActionOnUpdate();
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
            $table->timestamps();
        });

        Schema::create('merge_acquisition_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(table: 'merge_acquisition')
                ->cascadeOnDelete()
                ->noActionOnUpdate();
            $table->string('action');
            $table->longText('audit_description')->nullable();
            $table->timestamps();
        });

        Schema::create('merge_acquisition_attachment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(table: 'merge_acquisition')
                ->cascadeOnDelete()
                ->noActionOnUpdate();
            $table->string('mimetype');
            $table->text('file_path');
            $table->string('filename');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('merge_acquisition_financial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(table: 'merge_acquisition')
                ->cascadeOnDelete()
                ->noActionOnUpdate();
            $table->integer('year');
            $table->string('sales');
            $table->string('income');
            $table->string('pfn');
            $table->string('ebitda');
            $table->string('debt')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('merge_acquisition_favorite_person', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(table: 'merge_acquisition')
                ->cascadeOnDelete()
                ->noActionOnUpdate();
            $table->foreignId('user_id')->constrained(table: 'users')->restrictOnDelete()->noActionOnUpdate();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('merge_acquisition_contact_request', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merge_acquisition_id')
                ->constrained(table: 'merge_acquisition')
                ->cascadeOnDelete()
                ->noActionOnUpdate();
            $table->unsignedInteger('email_id')->nullable()->index();
            $table->string('requester_name');
            $table->string('requester_surname');
            $table->string('requester_email');
            $table->string('requester_phone');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('merge_acquisition_contact_request');
        Schema::dropIfExists('merge_acquisition_favorite_person');
        Schema::dropIfExists('merge_acquisition_financial');
        Schema::dropIfExists('merge_acquisition_attachment');
        Schema::dropIfExists('merge_acquisition_audit');
        Schema::dropIfExists('merge_acquisition');
        Schema::dropIfExists('merge_acquisition_economic_activity');
    }
};
