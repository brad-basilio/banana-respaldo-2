// Botón de PDF Rápido desde thumbnails
<Button
    variant="ghost"
    size="sm"
    tooltip="Exportar PDF rápido desde thumbnails"
    onClick={handleExportPDFFromThumbnails}
    disabled={isPDFGenerating || Object.keys(pageThumbnails).length === 0}
    className={`text-white hover:bg-white/10 ${isPDFGenerating || Object.keys(pageThumbnails).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
    icon={<Zap className="h-4 w-4" />}
>
    PDF Rápido
</Button>
