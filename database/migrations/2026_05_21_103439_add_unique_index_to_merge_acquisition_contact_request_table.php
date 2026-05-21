<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('merge_acquisition_contact_request', function (Blueprint $table): void {
            $table->unique(
                ['merge_acquisition_id', 'requester_email'],
                'merge_acquisition_contact_request_unique_requester',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::table('merge_acquisition_contact_request', function (Blueprint $table): void {
            $table->dropUnique('merge_acquisition_contact_request_unique_requester');
        });
    }
};
