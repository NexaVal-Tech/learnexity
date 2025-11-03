<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseLearning extends Model
{
    protected $fillable = ['course_id', 'learning_point', 'order'];
}