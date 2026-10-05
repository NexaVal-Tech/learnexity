<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-edited text for the transactional emails (Website CMS → Emails).
 * A row only exists once an admin customises an email; without one the
 * email is sent exactly as designed in resources/views/emails.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('email_templates')) {
            return;
        }

        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80)->unique();          // see App\Support\EmailTemplateRegistry
            $table->string('subject', 255)->nullable();    // empty = original subject
            $table->boolean('customize_body')->default(false);
            $table->string('heading', 255)->nullable();
            $table->text('body')->nullable();
            $table->string('button_label', 120)->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
