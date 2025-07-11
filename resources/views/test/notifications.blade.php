<!DOCTYPE html>
<html>
<head>
    <title>Test de Notificaciones</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .test-section { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #0056b3; }
        .btn.success { background: #28a745; }
        .btn.danger { background: #dc3545; }
        .result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .result.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .result.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .status { font-weight: bold; }
        .email-info { background: #e2e3e5; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🧪 Test de Notificaciones</h1>
    <p>Esta página permite probar el sistema de notificaciones duales (cliente + administrador).</p>

    <!-- Status del Email Corporativo -->
    <div class="test-section">
        <h2>📧 Estado del Email Corporativo</h2>
        <button class="btn" onclick="checkCorporateEmail()">Verificar Configuración</button>
        <div id="email-status"></div>
    </div>

    <!-- Test de Notificación de Contacto -->
    <div class="test-section">
        <h2>💬 Test de Notificación de Contacto</h2>
        <p>Envía una notificación de contacto tanto al cliente como al administrador.</p>
        <button class="btn" onclick="testContactNotification()">Enviar Test de Contacto</button>
        <div id="contact-result"></div>
    </div>

    <!-- Test de Notificación de Compra -->
    <div class="test-section">
        <h2>🛒 Test de Notificación de Compra</h2>
        <p>Envía una notificación de compra tanto al cliente como al administrador.</p>
        <button class="btn" onclick="testPurchaseNotification()">Enviar Test de Compra</button>
        <div id="purchase-result"></div>
    </div>

    <!-- Información -->
    <div class="test-section">
        <h2>ℹ️ Información</h2>
        <p><strong>¿Cómo funciona?</strong></p>
        <ul>
            <li>El sistema envía automáticamente dos emails por cada evento</li>
            <li>Uno al cliente (con la plantilla original)</li>
            <li>Otro al administrador (con información específica para admin)</li>
            <li>El email del administrador se configura en <code>coorporative_email</code></li>
        </ul>
        
        <p><strong>Configuración requerida:</strong></p>
        <ul>
            <li>Configurar <code>coorporative_email</code> en el panel de administración</li>
            <li>Configurar el servidor de correo (SMTP) en <code>.env</code></li>
            <li>Ejecutar el seeder: <code>php artisan db:seed --class=GeneralsPixelsSeeder</code></li>
        </ul>
    </div>

    <script>
        // Verificar email corporativo
        function checkCorporateEmail() {
            fetch('/test/notifications/corporate-email')
                .then(response => response.json())
                .then(data => {
                    const statusDiv = document.getElementById('email-status');
                    const isConfigured = data.is_configured;
                    
                    statusDiv.innerHTML = `
                        <div class="email-info">
                            <div class="status ${isConfigured ? 'success' : 'error'}">
                                Estado: ${isConfigured ? '✅ Configurado' : '❌ No configurado'}
                            </div>
                            <div>Email: ${data.corporate_email || 'No configurado'}</div>
                        </div>
                    `;
                });
        }

        // Test de notificación de contacto
        function testContactNotification() {
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Enviando...';
            
            fetch('/test/notifications/contact', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    const resultDiv = document.getElementById('contact-result');
                    const isSuccess = data.status === 'success';
                    
                    resultDiv.innerHTML = `
                        <div class="result ${isSuccess ? 'success' : 'error'}">
                            <strong>${isSuccess ? '✅ Éxito' : '❌ Error'}:</strong> ${data.message}
                            ${data.corporate_email ? `<br>Email admin: ${data.corporate_email}` : ''}
                        </div>
                    `;
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = 'Enviar Test de Contacto';
                });
        }

        // Test de notificación de compra
        function testPurchaseNotification() {
            const button = event.target;
            button.disabled = true;
            button.textContent = 'Enviando...';
            
            fetch('/test/notifications/purchase', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    const resultDiv = document.getElementById('purchase-result');
                    const isSuccess = data.status === 'success';
                    
                    resultDiv.innerHTML = `
                        <div class="result ${isSuccess ? 'success' : 'error'}">
                            <strong>${isSuccess ? '✅ Éxito' : '❌ Error'}:</strong> ${data.message}
                            ${data.sale_id ? `<br>Sale ID: ${data.sale_id}` : ''}
                            ${data.corporate_email ? `<br>Email admin: ${data.corporate_email}` : ''}
                        </div>
                    `;
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = 'Enviar Test de Compra';
                });
        }

        // Verificar email al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            checkCorporateEmail();
        });
    </script>
</body>
</html>
