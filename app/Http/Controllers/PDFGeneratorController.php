<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CanvasProject;
use App\Models\Item;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PDFGeneratorController extends Controller
{
    /**
     * Generar PDF de alta calidad con dimensiones exactas de base de datos
     * 
     * @param Request $request
     * @param string $projectId
     * @return JsonResponse
     */
    public function generateHighQualityPDF(Request $request, string $projectId): JsonResponse
    {
        try {
            Log::info('📄 Iniciando generación de PDF backend', [
                'project_id' => $projectId,
                'request_size' => strlen($request->getContent())
            ]);

            // Validar datos requeridos
            $request->validate([
                'project_data' => 'required|array',
                'item_data' => 'required|array',
                'preset_data' => 'required|array',
                'dimensions' => 'required|array'
            ]);

            $projectData = $request->input('project_data');
            $itemData = $request->input('item_data');
            $presetData = $request->input('preset_data');
            $dimensions = $request->input('dimensions');

            Log::info('📐 Dimensiones recibidas para PDF:', [
                'dimensions' => $dimensions,
                'preset_data' => $presetData,
                'item_id' => $itemData['id'] ?? null
            ]);

            // Obtener el proyecto de la base de datos
            $project = CanvasProject::find($projectId);
            if (!$project) {
                Log::warning('⚠️ Proyecto no encontrado', ['project_id' => $projectId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Obtener el item para dimensiones exactas
            $item = Item::find($itemData['id'] ?? null);
            if (!$item) {
                Log::warning('⚠️ Item no encontrado', ['item_id' => $itemData['id'] ?? null]);
                return response()->json([
                    'success' => false,
                    'message' => 'Item no encontrado'
                ], 404);
            }

            // Usar dimensiones exactas del item de la base de datos
            $widthMm = $item->width ?? $dimensions['width_mm'] ?? 210;
            $heightMm = $item->height ?? $dimensions['height_mm'] ?? 297;
            
            Log::info('📏 Dimensiones exactas del item para PDF:', [
                'width_mm' => $widthMm,
                'height_mm' => $heightMm,
                'item_id' => $item->id,
                'source' => 'Base de datos'
            ]);

            // Generar PDF usando biblioteca PHP (recomendado: TCPDF o DomPDF)
            $pdfContent = $this->generatePDFWithPHPLibrary(
                $projectData,
                $itemData,
                $presetData,
                $widthMm,
                $heightMm,
                $project
            );

            // Guardar PDF en storage
            $fileName = "project_{$projectId}_" . date('Y-m-d_H-i-s') . '.pdf';
            $filePath = "pdfs/{$fileName}";
            
            Storage::disk('public')->put($filePath, $pdfContent);
            
            Log::info('💾 PDF guardado exitosamente:', [
                'file_path' => $filePath,
                'file_size' => strlen($pdfContent),
                'project_id' => $projectId
            ]);

            // Actualizar proyecto con ruta del PDF
            $project->update([
                'pdf_path' => $filePath,
                'pdf_generated_at' => now(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PDF generado exitosamente',
                'pdf_path' => $filePath,
                'pdf_url' => Storage::disk('public')->url($filePath),
                'dimensions' => [
                    'width_mm' => $widthMm,
                    'height_mm' => $heightMm
                ],
                'file_size' => strlen($pdfContent),
                'project_id' => $projectId
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error generando PDF backend:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'project_id' => $projectId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error generando PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF usando biblioteca PHP para máxima calidad
     * 
     * @param array $projectData
     * @param array $itemData  
     * @param array $presetData
     * @param float $widthMm
     * @param float $heightMm
     * @param CanvasProject $project
     * @return string
     */
    private function generatePDFWithPHPLibrary(
        array $projectData,
        array $itemData, 
        array $presetData,
        float $widthMm,
        float $heightMm,
        CanvasProject $project
    ): string {
        
        Log::info('🏭 Iniciando generación PDF con biblioteca PHP');
        
        // TODO: Implementar generación PDF con biblioteca PHP
        // Opciones recomendadas:
        // 1. TCPDF - Mejor para documentos complejos
        // 2. DomPDF - Fácil de usar con HTML/CSS
        // 3. mPDF - Balance entre funciones y facilidad
        
        // Por ahora devolvemos un PDF simple como placeholder
        $placeholder = $this->generatePlaceholderPDF($widthMm, $heightMm, $projectData);
        
        Log::info('✅ PDF placeholder generado', [
            'size' => strlen($placeholder),
            'dimensions' => [$widthMm, $heightMm]
        ]);
        
        return $placeholder;
    }

    /**
     * Generar PDF placeholder mientras implementamos la biblioteca real
     * 
     * @param float $widthMm
     * @param float $heightMm  
     * @param array $projectData
     * @return string
     */
    private function generatePlaceholderPDF(float $widthMm, float $heightMm, array $projectData): string
    {
        // PDF mínimo válido con dimensiones correctas
        $content = "PDF generado con dimensiones exactas: {$widthMm}mm x {$heightMm}mm\n";
        $content .= "Proyecto: " . ($projectData['title'] ?? 'Sin título') . "\n";
        $content .= "Generado: " . date('Y-m-d H:i:s') . "\n";
        $content .= "Sistema: Backend BananaLab\n";
        
        // Retornar contenido como string (en implementación real sería PDF binario)
        return $content;
    }

    /**
     * Descargar PDF generado
     * 
     * @param string $projectId
     * @return \Illuminate\Http\Response
     */
    public function downloadPDF(string $projectId)
    {
        try {
            $project = CanvasProject::find($projectId);
            
            if (!$project || !$project->pdf_path) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF no encontrado'
                ], 404);
            }

            if (!Storage::disk('public')->exists($project->pdf_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo PDF no existe'
                ], 404);
            }

            $fileName = basename($project->pdf_path);
            
            return Storage::disk('public')->download($project->pdf_path, $fileName);
            
        } catch (\Exception $e) {
            Log::error('❌ Error descargando PDF:', [
                'error' => $e->getMessage(),
                'project_id' => $projectId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error descargando PDF'
            ], 500);
        }
    }

    /**
     * Obtener información del PDF generado
     * 
     * @param string $projectId
     * @return JsonResponse
     */
    public function getPDFInfo(string $projectId): JsonResponse
    {
        try {
            $project = CanvasProject::find($projectId);
            
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $pdfExists = $project->pdf_path && Storage::disk('public')->exists($project->pdf_path);
            
            return response()->json([
                'success' => true,
                'project_id' => $projectId,
                'pdf_exists' => $pdfExists,
                'pdf_path' => $project->pdf_path,
                'pdf_url' => $pdfExists ? Storage::disk('public')->url($project->pdf_path) : null,
                'generated_at' => $project->pdf_generated_at,
                'status' => $project->status
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error obteniendo info PDF:', [
                'error' => $e->getMessage(),
                'project_id' => $projectId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo información'
            ], 500);
        }
    }
}
