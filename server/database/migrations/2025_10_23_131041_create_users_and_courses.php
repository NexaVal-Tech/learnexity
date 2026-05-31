<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersAndCourses extends Migration
{
    public function up()
    {
        Schema::create('users', function(Blueprint $t){
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->timestamp('email_verified_at')->nullable();
            $t->string('password')->nullable(); // null when registered by Google
            $t->string('google_id')->nullable();
            $t->string('twofa_secret')->nullable(); // optional
            $t->rememberToken();
            $t->timestamps();
        });

        Schema::create('purchases', function(Blueprint $t){
            $t->id();
            $t->foreignId('user_id')->constrained()->onDelete('cascade');
            $t->foreignId('course_id')->constrained()->onDelete('cascade');
            $t->string('stripe_session_id')->nullable();
            $t->timestamp('purchased_at')->nullable();
            $t->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('users');
    }
}
