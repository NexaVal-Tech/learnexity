<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseSalary extends Model
{
    protected $fillable = ['course_id', 'entry_level', 'mid_level', 'senior_level'];
}