<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        /*
        |--------------------------------------------------------------------------
        | SQLITE FIX (rebuild table)
        |--------------------------------------------------------------------------
        */
        if ($driver === 'sqlite') {

            DB::statement('
                CREATE TABLE material_items_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    course_material_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL CHECK(type IN (\'text\', \'pdf\', \'video\', \'document\', \'link\')),
                    file_url TEXT,
                    file_path TEXT,
                    file_size TEXT,
                    text_content TEXT,
                    "order" INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY (course_material_id)
                        REFERENCES course_materials(id)
                        ON DELETE CASCADE
                )
            ');

            DB::statement('
                INSERT INTO material_items_new
                (id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at)
                SELECT
                id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at
                FROM material_items
            ');

            DB::statement('DROP TABLE material_items');
            DB::statement('ALTER TABLE material_items_new RENAME TO material_items');
        }

        /*
        |--------------------------------------------------------------------------
        | MYSQL FIX (simple alter table)
        |--------------------------------------------------------------------------
        */
        else {

            Schema::table('material_items', function (Blueprint $table) {
                if (!Schema::hasColumn('material_items', 'text_content')) {
                    $table->longText('text_content')->nullable()->after('file_size');
                }
            });

        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {

            DB::statement('
                CREATE TABLE material_items_old (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    course_material_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL CHECK(type IN (\'pdf\', \'video\', \'document\', \'link\')),
                    file_url TEXT,
                    file_path TEXT,
                    file_size TEXT,
                    "order" INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY (course_material_id)
                        REFERENCES course_materials(id)
                        ON DELETE CASCADE
                )
            ');

            DB::statement('
                INSERT INTO material_items_old
                (id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at)
                SELECT
                id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at
                FROM material_items
                WHERE type IN (\'pdf\', \'video\', \'document\', \'link\')
            ');

            DB::statement('DROP TABLE material_items');
            DB::statement('ALTER TABLE material_items_old RENAME TO material_items');
        }

        else {

            Schema::table('material_items', function (Blueprint $table) {
                $table->dropColumn('text_content');
            });

        }
    }
};