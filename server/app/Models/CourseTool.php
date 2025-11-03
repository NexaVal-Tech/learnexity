<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseTool extends Model
{
    protected $fillable = ['course_id', 'name', 'icon', 'order'];
}