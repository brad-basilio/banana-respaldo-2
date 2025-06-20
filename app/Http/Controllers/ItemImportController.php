<?php

namespace App\Http\Controllers;

use App\Imports\ItemImport;
use App\Imports\ItemImportSf;
use App\Services\ItemImportService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
// use App\Imports\ItemImport;

class ItemImportController extends Controller
{
    protected $importService;

    public function __construct(ItemImportService $importService)
    {
        $this->importService = $importService;
    }

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx'
            ]);

            $import = new ItemImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            if (!empty($errors)) {
                return response()->json(['error' => $errors], 400); // Código 400 para errores específicos
            }

            return response()->json(['message' => 'Importación exitosa'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422); // Código 422 para errores de validación
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al importar: ' . $e->getMessage()], 500);
        }
    }
}
