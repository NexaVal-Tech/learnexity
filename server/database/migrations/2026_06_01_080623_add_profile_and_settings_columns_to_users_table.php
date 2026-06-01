<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('avatar');
            $table->string('location')->nullable()->after('bio');
            $table->string('linkedin_url')->nullable()->after('location');
            $table->string('twitter_url')->nullable()->after('linkedin_url');
            $table->string('github_url')->nullable()->after('twitter_url');
            $table->string('website_url')->nullable()->after('github_url');
            $table->boolean('email_notifications')->default(true)->after('website_url');
            $table->boolean('marketing_emails')->default(false)->after('email_notifications');
            $table->boolean('sms_notifications')->default(false)->after('marketing_emails');
            $table->boolean('profile_public')->default(false)->after('sms_notifications');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar', 'bio', 'location',
                'linkedin_url', 'twitter_url', 'github_url', 'website_url',
                'email_notifications', 'marketing_emails',
                'sms_notifications', 'profile_public',
            ]);
        });
    }
};
