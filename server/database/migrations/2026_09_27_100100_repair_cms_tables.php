<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Some databases already had cms_* tables (with different columns) before
 * the Website CMS migration ran, so that migration skipped creating them.
 * This adds whatever columns the CMS needs that are missing, without
 * touching existing data, then marks the built-in pages as such.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->addMissing('cms_pages', [
            'slug'         => fn (Blueprint $t) => $t->string('slug', 120)->nullable(),
            'title'        => fn (Blueprint $t) => $t->string('title', 200)->nullable(),
            'is_system'    => fn (Blueprint $t) => $t->boolean('is_system')->default(false),
            'is_published' => fn (Blueprint $t) => $t->boolean('is_published')->default(true),
            'seo'          => fn (Blueprint $t) => $t->json('seo')->nullable(),
            'sections'     => fn (Blueprint $t) => $t->json('sections')->nullable(),
            'updated_by'   => fn (Blueprint $t) => $t->unsignedBigInteger('updated_by')->nullable(),
            'created_at'   => fn (Blueprint $t) => $t->timestamp('created_at')->nullable(),
            'updated_at'   => fn (Blueprint $t) => $t->timestamp('updated_at')->nullable(),
        ]);

        $this->addMissing('cms_globals', [
            'key'        => fn (Blueprint $t) => $t->string('key', 60)->nullable(),
            'data'       => fn (Blueprint $t) => $t->json('data')->nullable(),
            'updated_by' => fn (Blueprint $t) => $t->unsignedBigInteger('updated_by')->nullable(),
            'created_at' => fn (Blueprint $t) => $t->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $t) => $t->timestamp('updated_at')->nullable(),
        ]);

        $this->addMissing('cms_media', [
            'type'          => fn (Blueprint $t) => $t->string('type', 10)->default('image'),
            'path'          => fn (Blueprint $t) => $t->string('path')->nullable(),
            'url'           => fn (Blueprint $t) => $t->string('url', 500)->nullable(),
            'mime_type'     => fn (Blueprint $t) => $t->string('mime_type', 100)->nullable(),
            'size'          => fn (Blueprint $t) => $t->unsignedBigInteger('size')->default(0),
            'original_name' => fn (Blueprint $t) => $t->string('original_name')->nullable(),
            'alt'           => fn (Blueprint $t) => $t->string('alt')->nullable(),
            'width'         => fn (Blueprint $t) => $t->unsignedInteger('width')->nullable(),
            'height'        => fn (Blueprint $t) => $t->unsignedInteger('height')->nullable(),
            'uploaded_by'   => fn (Blueprint $t) => $t->unsignedBigInteger('uploaded_by')->nullable(),
            'created_at'    => fn (Blueprint $t) => $t->timestamp('created_at')->nullable(),
            'updated_at'    => fn (Blueprint $t) => $t->timestamp('updated_at')->nullable(),
        ]);

        $this->addMissing('cms_revisions', [
            'subject_type' => fn (Blueprint $t) => $t->string('subject_type', 10)->default('page'),
            'subject_key'  => fn (Blueprint $t) => $t->string('subject_key', 120)->nullable(),
            'snapshot'     => fn (Blueprint $t) => $t->json('snapshot')->nullable(),
            'admin_id'     => fn (Blueprint $t) => $t->unsignedBigInteger('admin_id')->nullable(),
            'created_at'   => fn (Blueprint $t) => $t->timestamp('created_at')->nullable(),
        ]);

        // Rows for built-in pages must be flagged as such and always published.
        if (Schema::hasTable('cms_pages')) {
            $system = ['home', 'about', 'b2b', 'community', 'contact', 'our-team', 'kids', 'refer-earn',
                       'privacy-policy', 'terms-of-services', 'refund-policy'];
            DB::table('cms_pages')->whereIn('slug', $system)->update(['is_system' => true, 'is_published' => true]);
            DB::table('cms_pages')->whereNull('is_published')->update(['is_published' => true]);
            DB::table('cms_pages')->whereNull('is_system')->update(['is_system' => false]);
        }
    }

    public function down(): void
    {
        // Nothing to undo safely — columns may have pre-existed.
    }

    /** @param array<string, callable(Blueprint): mixed> $columns */
    private function addMissing(string $table, array $columns): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }
        foreach ($columns as $name => $define) {
            if (!Schema::hasColumn($table, $name)) {
                Schema::table($table, fn (Blueprint $t) => $define($t));
            }
        }
    }
};
