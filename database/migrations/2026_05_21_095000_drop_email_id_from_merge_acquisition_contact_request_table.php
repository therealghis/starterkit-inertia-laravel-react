<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void {
        Schema::table('merge_acquisition_contact_request', function (Blueprint $table): void {
            $table->dropIndex(['email_id']);
            $table->dropColumn('email_id');
        });
    }

    public function down(): void {
        Schema::table('merge_acquisition_contact_request', function (Blueprint $table): void {
            $table->unsignedInteger('email_id')->nullable()->index()->after('merge_acquisition_id');
        });
    }
};
