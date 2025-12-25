<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


// MaterialItemProgress Model
class MaterialItemProgress extends Model
{
    protected $table = 'material_item_progress';
    
    protected $fillable = [
        'user_id',
        'material_item_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materialItem(): BelongsTo
    {
        return $this->belongsTo(MaterialItem::class);
    }
}