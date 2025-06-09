<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AddGeneralDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('generals')->insert([
            'correlative' => 'message_contact_email', 
            'name' => 'Diseño de email de mensaje de contacto', 
            'description' => '<p>Hola, {{nombre}}</p>',
        ]);
    }
}
