<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Píxeles - {{ env('APP_NAME') }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 10px 0; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .badge-success { background: #28a745; color: white; }
        .badge-warning { background: #ffc107; color: black; }
    </style>
    
    {!! $headScripts !!}
</head>
<body>
    {!! $bodyScripts !!}
    
    <div class="container">
        <h1>🎯 Test de Configuración de Píxeles</h1>
        
        <div class="card info">
            <h2>📊 Estado de Píxeles Configurados</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                
                <div>
                    <strong>Google Analytics:</strong>
                    @if($pixelData['google_analytics_id'])
                        <span class="badge badge-success">Configurado</span>
                        <br><code>{{ $pixelData['google_analytics_id'] }}</code>
                    @else
                        <span class="badge badge-warning">No configurado</span>
                    @endif
                </div>
                
                <div>
                    <strong>Google Tag Manager:</strong>
                    @if($pixelData['google_tag_manager_id'])
                        <span class="badge badge-success">Configurado</span>
                        <br><code>{{ $pixelData['google_tag_manager_id'] }}</code>
                    @else
                        <span class="badge badge-warning">No configurado</span>
                    @endif
                </div>
                
                <div>
                    <strong>Facebook Pixel:</strong>
                    @if($pixelData['facebook_pixel_id'])
                        <span class="badge badge-success">Configurado</span>
                        <br><code>{{ $pixelData['facebook_pixel_id'] }}</code>
                    @else
                        <span class="badge badge-warning">No configurado</span>
                    @endif
                </div>
                
                <div>
                    <strong>TikTok Pixel:</strong>
                    @if($pixelData['tiktok_pixel_id'])
                        <span class="badge badge-success">Configurado</span>
                        <br><code>{{ $pixelData['tiktok_pixel_id'] }}</code>
                    @else
                        <span class="badge badge-warning">No configurado</span>
                    @endif
                </div>
                
            </div>
        </div>

        <div class="card success">
            <h2>✅ Scripts Inyectados en HEAD</h2>
            <pre>{{ $headScripts ?: 'No hay scripts configurados en el HEAD' }}</pre>
        </div>

        <div class="card warning">
            <h2>📝 Scripts Inyectados en BODY</h2>
            <pre>{{ $bodyScripts ?: 'No hay scripts configurados en el BODY' }}</pre>
        </div>

        <div class="card info">
            <h2>🔧 Instrucciones</h2>
            <ol>
                <li>Ve a la <strong>Configuración General</strong> en el admin</li>
                <li>Selecciona la pestaña <strong>"Píxeles & Analytics"</strong></li>
                <li>Configura los IDs de tus plataformas de marketing</li>
                <li>Los píxeles se inyectarán automáticamente en todas las páginas</li>
            </ol>
            
            <p><strong>URL del Admin:</strong> <a href="/admin/generals">/admin/generals</a></p>
        </div>

        <div class="card">
            <h2>🧪 Test de Eventos</h2>
            <button onclick="testEvents()" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                Disparar Eventos de Test
            </button>
            <div id="testResults" style="margin-top: 10px;"></div>
        </div>
    </div>

    <script>
        function testEvents() {
            const results = document.getElementById('testResults');
            results.innerHTML = '<p>🔄 Disparando eventos de test...</p>';
            
            let eventResults = [];
            
            // Test Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'test_event', {
                    'event_category': 'engagement',
                    'event_label': 'pixel_test'
                });
                eventResults.push('✅ Google Analytics event enviado');
            } else {
                eventResults.push('❌ Google Analytics no detectado');
            }
            
            // Test Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'PageView');
                eventResults.push('✅ Facebook Pixel PageView enviado');
            } else {
                eventResults.push('❌ Facebook Pixel no detectado');
            }
            
            // Test TikTok Pixel
            if (typeof ttq !== 'undefined') {
                ttq.track('ClickButton', {
                    'content_category': 'test'
                });
                eventResults.push('✅ TikTok Pixel event enviado');
            } else {
                eventResults.push('❌ TikTok Pixel no detectado');
            }
            
            results.innerHTML = '<ul><li>' + eventResults.join('</li><li>') + '</li></ul>';
        }
        
        // Auto-test al cargar la página
        window.addEventListener('load', function() {
            console.log('🎯 Píxeles cargados y listos para tracking');
            console.log('Google Analytics:', typeof gtag !== 'undefined' ? '✅' : '❌');
            console.log('Facebook Pixel:', typeof fbq !== 'undefined' ? '✅' : '❌');
            console.log('TikTok Pixel:', typeof ttq !== 'undefined' ? '✅' : '❌');
        });
    </script>
</body>
</html>
