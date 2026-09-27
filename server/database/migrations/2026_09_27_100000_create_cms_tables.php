<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Website CMS.
 *
 * Content model: every public page is an ordered list of "sections"
 * (blocks), each `{ id, type, hidden, data }`, stored as JSON on the page
 * row. The frontend owns the block types (what each one looks like and
 * which fields it has) and the default content for every built-in page, so
 * a page with no row here simply renders its defaults. The backend treats
 * `sections` as opaque JSON apart from sanitizing HTML/URL values at save
 * time (see App\Services\CmsContentSanitizer).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Skip if a previous, interrupted run already created it (SQLite
        // doesn't roll back CREATE TABLE when a later step fails).
        if (!Schema::hasTable('cms_pages')) Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            // Stable identifier: 'home', 'about', … for built-in pages, or a
            // URL slug for pages created in the page builder.
            $table->string('slug', 120)->unique();
            $table->string('title', 200);
            // Built-in pages map to existing routes and can't be deleted or
            // re-slugged; custom pages are served by pages/[slug].tsx.
            $table->boolean('is_system')->default(false);
            $table->boolean('is_published')->default(true);
            $table->json('seo')->nullable();       // { title, description, og_image }
            $table->json('sections')->nullable();  // [{ id, type, hidden, data }]
            $table->foreignId('updated_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });

        // Site-wide content that isn't tied to one page (navbar, footer).
        // Skip if a previous, interrupted run already created it (SQLite
        // doesn't roll back CREATE TABLE when a later step fails).
        if (!Schema::hasTable('cms_globals')) Schema::create('cms_globals', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->json('data')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });

        // Skip if a previous, interrupted run already created it (SQLite
        // doesn't roll back CREATE TABLE when a later step fails).
        if (!Schema::hasTable('cms_media')) Schema::create('cms_media', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['image', 'video']);
            $table->string('path');          // path on the 'public' disk
            $table->string('url', 500);      // absolute public URL
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->string('original_name');
            $table->string('alt')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();

            $table->index('type');
        });

        // Snapshot taken before every save, so an admin can roll back a
        // page/global that got broken. Pruned to the latest N per subject.
        // Skip if a previous, interrupted run already created it (SQLite
        // doesn't roll back CREATE TABLE when a later step fails).
        if (!Schema::hasTable('cms_revisions')) Schema::create('cms_revisions', function (Blueprint $table) {
            $table->id();
            $table->enum('subject_type', ['page', 'global']);
            $table->string('subject_key', 120);
            $table->json('snapshot');
            $table->foreignId('admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index(['subject_type', 'subject_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_revisions');
        Schema::dropIfExists('cms_media');
        Schema::dropIfExists('cms_globals');
        Schema::dropIfExists('cms_pages');
    }
};
