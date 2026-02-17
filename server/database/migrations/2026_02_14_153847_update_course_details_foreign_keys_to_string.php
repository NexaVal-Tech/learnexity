<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // Disable foreign key checks based on database driver
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        // Tables to update
        $tables = [
            'course_tools' => [
                'id' => 'id',
                'course_id' => 'string',
                'name' => 'string',
                'icon' => 'string|nullable',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_learnings' => [
                'id' => 'id',
                'course_id' => 'string',
                'learning_point' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_benefits' => [
                'id' => 'id',
                'course_id' => 'string',
                'title' => 'string',
                'text' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_career_paths' => [
                'id' => 'id',
                'course_id' => 'string',
                'level' => 'enum:entry,mid,advanced,specialized',
                'position' => 'string',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_industries' => [
                'id' => 'id',
                'course_id' => 'string',
                'title' => 'string',
                'text' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_salaries' => [
                'id' => 'id',
                'course_id' => 'string',
                'entry_level' => 'string|nullable',
                'mid_level' => 'string|nullable',
                'senior_level' => 'string|nullable',
                'timestamps' => true,
            ],
        ];

        foreach ($tables as $tableName => $structure) {
            if (Schema::hasTable($tableName)) {
                $this->recreateTable($tableName, $structure);
            }
        }

        // Re-enable foreign key checks
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }
    }

    /**
     * Recreate a table with new structure
     */
    private function recreateTable(string $tableName, array $structure): void
    {
        $backupTable = $tableName . '_backup';

        // Create backup
        Schema::dropIfExists($backupTable);
        DB::statement("CREATE TABLE {$backupTable} AS SELECT * FROM {$tableName}");

        // Drop original table
        Schema::dropIfExists($tableName);

        // Recreate table with new structure
        Schema::create($tableName, function (Blueprint $table) use ($structure) {
            foreach ($structure as $field => $type) {
                if ($field === 'id') {
                    $table->id();
                } elseif ($field === 'timestamps') {
                    $table->timestamps();
                } elseif ($field === 'course_id') {
                    $table->string('course_id');
                } else {
                    $this->addField($table, $field, $type);
                }
            }

            // Add foreign key for course_id
            $table->foreign('course_id')
                  ->references('course_id')
                  ->on('courses')
                  ->onDelete('cascade');
        });

        // Restore data
        DB::statement("INSERT INTO {$tableName} SELECT * FROM {$backupTable}");

        // Drop backup
        Schema::dropIfExists($backupTable);
    }

    /**
     * Add field to table based on type definition
     */
    private function addField(Blueprint $table, string $field, string $type): void
    {
        $parts = explode('|', $type);
        $baseType = $parts[0];
        $modifiers = array_slice($parts, 1);

        $column = null;

        // Handle different field types
        if ($baseType === 'string') {
            $column = $table->string($field);
        } elseif ($baseType === 'text') {
            $column = $table->text($field);
        } elseif ($baseType === 'integer') {
            $column = $table->integer($field);
        } elseif (strpos($baseType, 'enum:') === 0) {
            $values = explode(',', substr($baseType, 5));
            $column = $table->enum($field, $values);
        }

        // Apply modifiers
        if ($column) {
            foreach ($modifiers as $modifier) {
                if ($modifier === 'nullable') {
                    $column->nullable();
                } elseif (strpos($modifier, 'default:') === 0) {
                    $defaultValue = substr($modifier, 8);
                    $column->default($defaultValue);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        // Disable foreign key checks
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        // Tables to revert
        $tables = [
            'course_tools' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'name' => 'string',
                'icon' => 'string|nullable',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_learnings' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'learning_point' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_benefits' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'title' => 'string',
                'text' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_career_paths' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'level' => 'enum:entry,mid,advanced,specialized',
                'position' => 'string',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_industries' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'title' => 'string',
                'text' => 'text',
                'order' => 'integer|default:0',
                'timestamps' => true,
            ],
            'course_salaries' => [
                'id' => 'id',
                'course_id' => 'foreignId',
                'entry_level' => 'string|nullable',
                'mid_level' => 'string|nullable',
                'senior_level' => 'string|nullable',
                'timestamps' => true,
            ],
        ];

        foreach ($tables as $tableName => $structure) {
            if (Schema::hasTable($tableName)) {
                $this->revertTable($tableName, $structure);
            }
        }

        // Re-enable foreign key checks
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }
    }

    /**
     * Revert a table to original structure
     */
    private function revertTable(string $tableName, array $structure): void
    {
        $backupTable = $tableName . '_backup';

        // Create backup
        Schema::dropIfExists($backupTable);
        DB::statement("CREATE TABLE {$backupTable} AS SELECT * FROM {$tableName}");

        // Drop original table
        Schema::dropIfExists($tableName);

        // Recreate table with old structure
        Schema::create($tableName, function (Blueprint $table) use ($structure) {
            foreach ($structure as $field => $type) {
                if ($field === 'id') {
                    $table->id();
                } elseif ($field === 'timestamps') {
                    $table->timestamps();
                } elseif ($field === 'course_id' && $type === 'foreignId') {
                    $table->foreignId('course_id')->constrained()->onDelete('cascade');
                } else {
                    $this->addField($table, $field, $type);
                }
            }
        });

        // Restore data
        DB::statement("INSERT INTO {$tableName} SELECT * FROM {$backupTable}");

        // Drop backup
        Schema::dropIfExists($backupTable);
    }
};