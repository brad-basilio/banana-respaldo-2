<?php

require 'vendor/autoload.php';
require 'bootstrap/app.php';

use App\Models\CanvasProject;

$projects = CanvasProject::select('id', 'name', 'created_at')->get();

echo "Proyectos disponibles:\n";
foreach($projects as $p) {
    echo "ID: " . $p->id . " - " . $p->name . " (" . $p->created_at . ")\n";
}

echo "\nTotal: " . count($projects) . " proyectos\n";
