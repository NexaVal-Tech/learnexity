<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite does not support ALTER COLUMN or DROP CONSTRAINT.
        // We recreate the table with the updated CHECK constraint.

        // 1. Create a temporary table with the new constraint
        DB::statement('
            CREATE TABLE material_items_new (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                course_material_id INTEGER NOT NULL,
                title       TEXT NOT NULL,
                type        TEXT NOT NULL CHECK(type IN (\'text\', \'pdf\', \'video\', \'document\', \'link\')),
                file_url    TEXT,
                file_path   TEXT,
                file_size   TEXT,
                text_content TEXT,
                "order"     INTEGER NOT NULL DEFAULT 0,
                created_at  DATETIME,
                updated_at  DATETIME,
                FOREIGN KEY (course_material_id) REFERENCES course_materials(id) ON DELETE CASCADE
            )
        ');

        // 2. Copy all existing data over
        DB::statement('
            INSERT INTO material_items_new
                (id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at)
            SELECT
                id, course_material_id, title, type, file_url, file_path, file_size, "order", created_at, updated_at
            FROM material_items
        ');

        // 3. Drop the old table
        DB::statement('DROP TABLE material_items');

        // 4. Rename the new table
        DB::statement('ALTER TABLE material_items_new RENAME TO material_items');
    }

    public function down(): void
    {
        // Recreate with the original constraint (without 'text' and without text_content)
        DB::statement('
            CREATE TABLE material_items_old (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                course_material_id INTEGER NOT NULL,
                title       TEXT NOT NULL,
                type        TEXT NOT NULL CHECK(type IN (\'pdf\', \'video\', \'document\', \'link\')),
                file_url    TEXT,
                file_path   TEXT,
                file_size   TEXT,
                "order"     INTEGER NOT NULL DEFAULT 0,
                created_at  DATETIME,
                updated_at  DATETIME,
                FOREIGN KEY (course_material_id) REFERENCES course_materials(id) ON DELETE CASCADE
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
};