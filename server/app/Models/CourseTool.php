<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CourseTool extends Model
{
    protected $fillable = ['course_id', 'name', 'icon', 'order'];
    protected $appends = ['icon_url'];

    /**
     * Get full URL for icon
     */
    public function getIconUrlAttribute(): ?string
    {
        $icon = $this->icon;
 
        if (empty($icon)) {
            return null;
        }
 
        // Already a full URL — return as-is
        if (str_starts_with($icon, 'http://') || str_starts_with($icon, 'https://')) {
            return $icon;
        }
 
        // Relative path stored in the `public` disk — build storage URL
        return Storage::disk('public')->url($icon);
    }
}