/* Botón de PDF desde thumbnails de alta calidad del backend */
<Button
    variant="ghost"
    size="sm"
    tooltip="Generar PDF desde thumbnails de alta calidad (300 DPI)"
    onClick={handleExportPDFFromBackendThumbnails}
    disabled={isPDFGenerating}
    className={`text-white hover:bg-white/10 ${isPDFGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
    icon={isPDFGenerating ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    ) : (
        <Zap className="h-4 w-4" />
    )}
>
    PDF Thumbnails
</Button>
