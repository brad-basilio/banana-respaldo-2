<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BasicController;
use App\Models\CanvasProject;

/**
 * Controlador para manejar CanvasProject, extiende BasicController
 * para aprovechar el método media() y el manejo estándar de imágenes
 */
class CanvasProjectController extends BasicController
{
    public $model = CanvasProject::class;
}
