<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class ExternalResource extends Model
{
    protected $fillable = [
        'course_id',
        'category',
        'title',
        'description',
        'url',
        'source',
        'duration',
        'order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}