<!DOCTYPE html>
<html>
<head>
    <title>Canvas Save System Test</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <h1>Canvas Save System Integration Test</h1>
    
    <div id="results"></div>
    
    <button onclick="testEndpoints()">Test Save System Endpoints</button>
    
    <script>
        function testEndpoints() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing endpoints...</p>';
            
            // Test data
            const testData = {
                project_id: 'test-project-123',
                project_data: {
                    pages: [
                        {
                            id: 'page-1',
                            elements: [
                                {
                                    id: 'elem-1',
                                    type: 'text',
                                    content: 'Test text'
                                }
                            ]
                        }
                    ]
                },
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                element_id: 'test-element'
            };
            
            // Get CSRF token
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            
            // Test Auto Save
            fetch('/api/canvas/auto-save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    project_id: testData.project_id,
                    project_data: testData.project_data
                })
            })
            .then(response => response.json())
            .then(data => {
                results.innerHTML += '<h3>Auto Save Test:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                results.innerHTML += '<h3>Auto Save Error:</h3><pre>' + error.message + '</pre>';
            });
            
            // Test Manual Save
            fetch('/api/canvas/manual-save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    project_id: testData.project_id,
                    project_data: testData.project_data,
                    project_name: 'Test Project',
                    thumbnail: testData.image
                })
            })
            .then(response => response.json())
            .then(data => {
                results.innerHTML += '<h3>Manual Save Test:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                results.innerHTML += '<h3>Manual Save Error:</h3><pre>' + error.message + '</pre>';
            });
            
            // Test Image Upload
            fetch('/api/canvas/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    project_id: testData.project_id,
                    image: testData.image,
                    element_id: testData.element_id
                })
            })
            .then(response => response.json())
            .then(data => {
                results.innerHTML += '<h3>Image Upload Test:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                results.innerHTML += '<h3>Image Upload Error:</h3><pre>' + error.message + '</pre>';
            });
        }
    </script>
</body>
</html>
