<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\General;

class TestZohoEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:zoho-email {--email= : Email específico para probar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba el envío de correos específicamente a Zoho Mail';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Iniciando prueba de correo para Zoho Mail...');
        
        // Obtener email objetivo
        $targetEmail = $this->option('email');
        if (!$targetEmail) {
            $corporate = General::where('correlative', 'coorporative_email')->first();
            $targetEmail = $corporate ? $corporate->description : null;
        }
        
        if (!$targetEmail) {
            $this->error('❌ No se pudo obtener el email objetivo. Usa --email=tu@email.com');
            return 1;
        }
        
        $this->info("📧 Email objetivo: {$targetEmail}");
        
        // Mostrar configuración actual
        $this->showCurrentConfig();
        
        // Realizar pruebas
        $this->testBasicEmail($targetEmail);
        $this->testZohoSpecificRecommendations($targetEmail);
        
        $this->info('✅ Pruebas completadas. Revisa los logs para más detalles.');
        return 0;
    }
    
    private function showCurrentConfig()
    {
        $this->info('📋 Configuración actual de correo:');
        $this->line("   Host: " . config('mail.mailers.smtp.host'));
        $this->line("   Puerto: " . config('mail.mailers.smtp.port'));
        $this->line("   Encriptación: " . config('mail.mailers.smtp.encryption'));
        $this->line("   From: " . config('mail.from.address'));
        $this->line("   From Name: " . config('mail.from.name'));
        $this->newLine();
    }
    
    private function testBasicEmail($targetEmail)
    {
        $this->info('🧪 Prueba 1: Envío básico de correo...');
        
        try {
            Mail::raw('Este es un correo de prueba desde Laravel para verificar la entrega a Zoho Mail.', function ($message) use ($targetEmail) {
                $message->to($targetEmail)
                        ->subject('Prueba de correo Laravel - ' . now()->format('Y-m-d H:i:s'))
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
            
            $this->info('✅ Correo básico enviado exitosamente');
            Log::info('TestZohoEmail - Correo básico enviado', ['target' => $targetEmail]);
            
        } catch (\Exception $e) {
            $this->error('❌ Error enviando correo básico: ' . $e->getMessage());
            Log::error('TestZohoEmail - Error en correo básico', [
                'target' => $targetEmail,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    private function testZohoSpecificRecommendations($targetEmail)
    {
        $this->info('🔍 Análisis específico para Zoho Mail:');
        
        // Verificar si es dominio Zoho
        $isZoho = $this->isZohoEmail($targetEmail);
        $this->line("   Es email Zoho: " . ($isZoho ? 'Sí' : 'No'));
        
        // Verificar From domain
        $fromDomain = substr(strrchr(config('mail.from.address'), "@"), 1);
        $toDomain = substr(strrchr($targetEmail, "@"), 1);
        $serverHost = config('mail.mailers.smtp.host');
        
        $this->line("   Dominio emisor: {$fromDomain}");
        $this->line("   Dominio receptor: {$toDomain}");
        $this->line("   Servidor SMTP: {$serverHost}");
        
        // Análisis específico de la configuración
        if ($fromDomain === $toDomain) {
            $this->info('   ✅ Mismo dominio - Configuración óptima para Zoho!');
        } else {
            $this->warn('   ⚠️  Dominios diferentes - puede causar problemas');
        }
        
        // Verificar si el servidor SMTP coincide con el dominio
        $expectedServer = "mail.{$fromDomain}";
        if (strpos($serverHost, $fromDomain) !== false) {
            $this->info('   ✅ Servidor SMTP del mismo dominio - Excelente!');
        } else {
            $this->warn("   ⚠️  Servidor SMTP esperado: {$expectedServer}");
        }
        
        if ($isZoho) {
            $this->warn('⚠️  Diagnóstico específico para Zoho Mail:');
            
            if ($fromDomain === $toDomain && strpos($serverHost, $fromDomain) !== false) {
                $this->info('   ✅ Configuración perfecta para Zoho Mail!');
                $this->line('   📋 Posibles causas del problema:');
                $this->line('      1. Filtros de spam muy restrictivos en Zoho');
                $this->line('      2. Configuración de seguridad alta en la cuenta destino');
                $this->line('      3. Límites de rate en el servidor SMTP');
                $this->line('      4. Problemas de conectividad temporal');
                $this->line('      5. Carpeta de spam/cuarentena en Zoho');
            } else {
                $this->line('   📋 Recomendaciones estándar:');
                $this->line('      1. Verificar registros SPF del dominio emisor');
                $this->line('      2. Configurar DKIM si es posible');
                $this->line('      3. Revisar carpeta de SPAM en Zoho');
                $this->line('      4. Agregar el dominio emisor a lista blanca');
            }
            
            $this->line('   🔧 Acciones recomendadas para el cliente:');
            $this->line('      • Revisar carpeta de Spam/Junk en Zoho Mail');
            $this->line('      • Agregar informes@s-tech.com.pe a contactos');
            $this->line('      • Verificar filtros automáticos en Zoho');
            $this->line('      • Revisar configuración de seguridad en Zoho');
        }
        
        // Probar con headers adicionales específicos para Zoho
        $this->testZohoHeaders($targetEmail);
        
        // Prueba adicional: verificar conectividad SMTP
        $this->testSMTPConnectivity();
    }
    
    private function testZohoHeaders($targetEmail)
    {
        $this->info('🧪 Prueba 2: Correo con headers optimizados para Zoho...');
        
        try {
            Mail::raw('Este es un correo de prueba con headers optimizados para Zoho Mail.', function ($message) use ($targetEmail) {
                $message->to($targetEmail)
                        ->subject('Prueba Zoho Optimizada - ' . now()->format('Y-m-d H:i:s'))
                        ->from(config('mail.from.address'), config('mail.from.name'))
                        ->replyTo(config('mail.from.address'), config('mail.from.name'));
                
                // Headers adicionales para mejorar deliverability con Zoho
                $message->getHeaders()
                        ->addTextHeader('X-Mailer', 'Laravel')
                        ->addTextHeader('X-Priority', '3');
            });
            
            $this->info('✅ Correo optimizado enviado exitosamente');
            Log::info('TestZohoEmail - Correo optimizado enviado', ['target' => $targetEmail]);
            
        } catch (\Exception $e) {
            $this->error('❌ Error enviando correo optimizado: ' . $e->getMessage());
            Log::error('TestZohoEmail - Error en correo optimizado', [
                'target' => $targetEmail,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    private function testSMTPConnectivity()
    {
        $this->info('🧪 Prueba 3: Verificando conectividad SMTP...');
        
        try {
            $host = config('mail.mailers.smtp.host');
            $port = config('mail.mailers.smtp.port');
            
            $this->line("   Probando conexión a {$host}:{$port}...");
            
            // Crear una conexión socket simple para verificar conectividad
            $timeout = 10;
            $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
            
            if ($socket) {
                $this->info('   ✅ Conectividad SMTP exitosa');
                fclose($socket);
                
                // Probar autenticación SMTP básica
                $this->testSMTPAuth();
            } else {
                $this->error("   ❌ No se pudo conectar al servidor SMTP: {$errstr} ({$errno})");
                Log::error('TestZohoEmail - Error conectividad SMTP', [
                    'host' => $host,
                    'port' => $port,
                    'error' => $errstr,
                    'errno' => $errno
                ]);
            }
            
        } catch (\Exception $e) {
            $this->error('   ❌ Error verificando conectividad: ' . $e->getMessage());
            Log::error('TestZohoEmail - Error en verificación SMTP', [
                'error' => $e->getMessage()
            ]);
        }
    }
    
    private function testSMTPAuth()
    {
        $this->line('   🔐 Verificando autenticación SMTP...');
        
        try {
            // Usar el transportador de Laravel para verificar autenticación
            $transport = app('mailer')->getSwiftMailer()->getTransport();
            
            if (method_exists($transport, 'start')) {
                $transport->start();
                $this->info('   ✅ Autenticación SMTP exitosa');
                
                if (method_exists($transport, 'stop')) {
                    $transport->stop();
                }
            } else {
                $this->line('   ℹ️  No se puede verificar autenticación directamente');
            }
            
        } catch (\Exception $e) {
            $this->error('   ❌ Error en autenticación SMTP: ' . $e->getMessage());
            Log::error('TestZohoEmail - Error autenticación SMTP', [
                'error' => $e->getMessage()
            ]);
        }
    }
    
    private function isZohoEmail($email)
    {
        if (!$email) return false;
        
        $zohoPatterns = [
            '@zoho.com',
            '@zohomail.com',
        ];
        
        foreach ($zohoPatterns as $pattern) {
            if (strpos(strtolower($email), $pattern) !== false) {
                return true;
            }
        }
        
        // Dominios conocidos que usan Zoho
        $domain = substr(strrchr($email, "@"), 1);
        $possibleZohoDomains = ['s-tech.com.pe'];
        
        return in_array(strtolower($domain), $possibleZohoDomains);
    }
}
