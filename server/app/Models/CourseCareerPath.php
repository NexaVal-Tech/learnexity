<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseCareerPath extends Model
{
    protected $fillable = ['course_id', 'level', 'position', 'order'];
}