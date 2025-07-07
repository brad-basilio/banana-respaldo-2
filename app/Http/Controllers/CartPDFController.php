<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CanvasProject;
use App\Models\Item;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CartPDFController extends Controller
{
    /**
     * Procesar carrito y generar PDFs cuando sea necesario
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function processCartPDFs(Request $request): JsonResponse
    {
        try {
            Log::info('🛒 Procesando PDFs del carrito');
            
            $cartItems = $request->input('cart_items', []);
            $results = [];
            
            foreach ($cartItems as $item) {
                if ($item['type'] === 'custom_album' && isset($item['project_id'])) {
                    $result = $this->generatePDFForCartItem($item);
                    $results[] = $result;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'PDFs procesados exitosamente',
                'results' => $results
            ]);
            
        } catch (\Exception $e) {
            Log::error('❌ Error procesando PDFs del carrito:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error procesando PDFs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generar PDF para un item específico del carrito
     * 
     * @param array $cartItem
     * @return array
     */
    private function generatePDFForCartItem(array $cartItem): array
    {
        try {
            $projectId = $cartItem['project_id'];
            $project = CanvasProject::find($projectId);
            
            if (!$project) {
                throw new \Exception("Proyecto no encontrado: {$projectId}");
            }
            
            // Si ya tiene PDF generado, retornar info existente
            if ($project->pdf_path && Storage::disk('public')->exists($project->pdf_path)) {
                return [
                    'project_id' => $projectId,
                    'status' => 'already_generated',
                    'pdf_path' => $project->pdf_path,
                    'pdf_url' => asset('storage/' . $project->pdf_path)
                ];
            }
            
            // Obtener datos del PDF desde el item del carrito
            $pdfData = $cartItem['pdf_data'] ?? [];
            
            if (empty($pdfData)) {
                throw new \Exception("Datos de PDF no encontrados en el carrito");
            }
            
            // Llamar al generador de PDF
            $pdfGenerator = new PDFGeneratorController();
            $request = new Request($pdfData);
            $response = $pdfGenerator->generateHighQualityPDF($request, $projectId);
            
            $responseData = json_decode($response->getContent(), true);
            
            if ($responseData['success']) {
                return [
                    'project_id' => $projectId,
                    'status' => 'generated',
                    'pdf_path' => $responseData['pdf_path'],
                    'pdf_url' => $responseData['pdf_url']
                ];
            } else {
                throw new \Exception($responseData['message']);
            }
            
        } catch (\Exception $e) {
            Log::error('❌ Error generando PDF para item del carrito:', [
                'project_id' => $projectId ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            return [
                'project_id' => $projectId ?? 'unknown',
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Verificar estado de PDFs en el carrito
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkCartPDFStatus(Request $request): JsonResponse
    {
        try {
            $projectIds = $request->input('project_ids', []);
            $statuses = [];
            
            foreach ($projectIds as $projectId) {
                $project = CanvasProject::find($projectId);
                
                if (!$project) {
                    $statuses[$projectId] = [
                        'status' => 'project_not_found',
                        'pdf_exists' => false
                    ];
                    continue;
                }
                
                $pdfExists = $project->pdf_path && Storage::disk('public')->exists($project->pdf_path);
                
                $statuses[$projectId] = [
                    'status' => $project->status,
                    'pdf_exists' => $pdfExists,
                    'pdf_path' => $project->pdf_path,
                    'pdf_url' => $pdfExists ? asset('storage/' . $project->pdf_path) : null,
                    'generated_at' => $project->pdf_generated_at
                ];
            }
            
            return response()->json([
                'success' => true,
                'statuses' => $statuses
            ]);
            
        } catch (\Exception $e) {
            Log::error('❌ Error verificando estado PDFs:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error verificando estado: ' . $e->getMessage()
            ], 500);
        }
    }
}
