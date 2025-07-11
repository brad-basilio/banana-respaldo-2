<?php

namespace Database\Seeders;

use App\Models\Aboutus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AboutusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aboutuses = [
            [
                'correlative' => 'banner',
                'name' => 'Editar banner y titulo',
                'description' => '',
                'title' => 'Nuestra historia, nuestra fuerza',
            ],
            [
                'correlative' => 'title_second',
                'name' => 'Editar titulo beneficios e imagen',
                'description' => '',
                'title' => 'Nuestra historia, nuestra fuerza',
            ],
            [
                'correlative' => 'card_one',
                'name' => 'Editar card uno',
                'description' => 'Cras volutpat aliquet ipsum. Morbi facilisis gravida mi, vel pulvinar enim aliquam malesuada.',
                'title' => 'Beneficio 1',
            ],
            [
                'correlative' => 'card_two',
                'name' => 'Editar card dos',
                'description' => 'Cras volutpat aliquet ipsum. Morbi facilisis gravida mi, vel pulvinar enim aliquam malesuada.',
                'title' => 'Beneficio 2',
            ],
            [
                'correlative' => 'card_three',
                'name' => 'Editar card tres',
                'description' => 'Cras volutpat aliquet ipsum. Morbi facilisis gravida mi, vel pulvinar enim aliquam malesuada.',
                'title' => 'Beneficio 3',
            ],
            [
                'correlative' => 'card_four',
                'name' => 'Editar card cuatro',
                'description' => 'Cras volutpat aliquet ipsum. Morbi facilisis gravida mi, vel pulvinar enim aliquam malesuada.',
                'title' => 'Beneficio 4',
            ],
            [
                'correlative' => 'title_mision',
                'name' => 'Editar titulo de mision y descripcion',
                'description' => '<p>In bibendum est eget metus aliquet consectetur. Donec convallis sagittis tortor non vestibulum. Nunc nec ex iaculis erat euismod facilisis. Etiam elementum, sem vitae sodales egestas, odio risus varius nisi, sed placerat mi neque ac erat.</p>',
                'title' => 'Nuestra misión',
            ],
            [
                'correlative' => 'title_vision',
                'name' => 'Editar titulo de vision y descripcion',
                'description' => '<p>In bibendum est eget metus aliquet consectetur. Donec convallis sagittis tortor non vestibulum. Nunc nec ex iaculis erat euismod facilisis. Etiam elementum, sem vitae sodales egestas, odio risus varius nisi, sed placerat mi neque ac erat.</p>',
                'title' => 'Nuestra visión',
            ],
            [
                'correlative' => 'image_vision_mision',
                'name' => 'Editar imagen de mision y vision',
                'description' => '',
                'title' => '',
            ],
           
        ];
        Aboutus::whereNotNull('id')->delete();
        foreach ($aboutuses as $aboutus) {
            Aboutus::updateOrCreate(['name' => $aboutus['name']], $aboutus);
        }
    }
}
