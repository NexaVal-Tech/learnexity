<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseIndustry extends Model
{
    protected $fillable = ['course_id', 'title', 'text', 'order'];
}