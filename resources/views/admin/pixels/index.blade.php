@extends('admin.template')

@section('title', 'Píxeles & Analytics')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box">
            <h4 class="page-title">Configuración de Píxeles & Analytics</h4>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-body">
                <div class="alert alert-info">
                    <strong>Información:</strong> Los píxeles y códigos de seguimiento se inyectan automáticamente en todas las páginas del sitio web.
                    Configure aquí los IDs de sus plataformas de analytics y marketing.
                </div>
                
                @php
                    $pixels = App\Helpers\PixelHelper::getPixelScripts();
                @endphp
                
                <div class="row">
                    <div class="col-md-6">
                        <h5>Estado de Configuración</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Plataforma</th>
                                        <th>Estado</th>
                                        <th>ID/Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Google Analytics</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('google_analytics_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('google_analytics_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                    <tr>
                                        <td>Google Tag Manager</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('google_tag_manager_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('google_tag_manager_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                    <tr>
                                        <td>Facebook Pixel</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('facebook_pixel_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('facebook_pixel_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                    <tr>
                                        <td>TikTok Pixel</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('tiktok_pixel_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('tiktok_pixel_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                    <tr>
                                        <td>Hotjar</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('hotjar_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('hotjar_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                    <tr>
                                        <td>Microsoft Clarity</td>
                                        <td>
                                            @if(App\Helpers\PixelHelper::getPixelData('clarity_id'))
                                                <span class="badge bg-success">Configurado</span>
                                            @else
                                                <span class="badge bg-warning">No configurado</span>
                                            @endif
                                        </td>
                                        <td><code>{{ App\Helpers\PixelHelper::getPixelData('clarity_id') ?: 'No configurado' }}</code></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <h5>Instrucciones de Configuración</h5>
                        <div class="accordion" id="pixelAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingGA">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGA">
                                        Google Analytics
                                    </button>
                                </h2>
                                <div id="collapseGA" class="accordion-collapse collapse" data-bs-parent="#pixelAccordion">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>Ve a <a href="https://analytics.google.com/" target="_blank">Google Analytics</a></li>
                                            <li>Crea una nueva propiedad o selecciona una existente</li>
                                            <li>Copia el ID que comienza con "G-" o "UA-"</li>
                                            <li>Pégalo en el campo "Google Analytics ID" en la configuración general</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFB">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFB">
                                        Facebook Pixel
                                    </button>
                                </h2>
                                <div id="collapseFB" class="accordion-collapse collapse" data-bs-parent="#pixelAccordion">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>Ve a <a href="https://business.facebook.com/events_manager" target="_blank">Facebook Events Manager</a></li>
                                            <li>Selecciona tu píxel o crea uno nuevo</li>
                                            <li>Copia el ID del píxel (números)</li>
                                            <li>Pégalo en el campo "Facebook Pixel ID"</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTT">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTT">
                                        TikTok Pixel
                                    </button>
                                </h2>
                                <div id="collapseTT" class="accordion-collapse collapse" data-bs-parent="#pixelAccordion">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>Ve a <a href="https://ads.tiktok.com/" target="_blank">TikTok Ads Manager</a></li>
                                            <li>Ve a "Assets" > "Events"</li>
                                            <li>Crea un nuevo píxel o selecciona uno existente</li>
                                            <li>Copia el Pixel ID</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <a href="{{ route('admin.generals.index') }}" class="btn btn-primary">
                                <i class="mdi mdi-cog"></i> Configurar Píxeles
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
