<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['weekly', 'monthly', 'quarterly', 'annual'])->index();
            $table->unsignedInteger('duration_days');
            $table->decimal('price', 10, 2);
            $table->json('benefits')->nullable();
            $table->enum('status', ['active', 'archived'])->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};
