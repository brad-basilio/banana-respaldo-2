<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tag;
use Carbon\Carbon;

class UpdatePromotionalTagsStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tags:update-promotional-status {--force : Forzar actualización de todos los tags}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualiza el estado promocional de todos los tags basado en sus fechas de inicio y fin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando actualización del estado promocional de tags...');
        
        $force = $this->option('force');
        
        // Obtener todos los tags o solo los promocionales
        $query = Tag::query();
        if (!$force) {
            $query->promotional(); // Solo tags con fechas
        }
        
        $tags = $query->get();
        $updated = 0;
        $permanent = 0;
        $active = 0;
        $expired = 0;

        foreach ($tags as $tag) {
            $oldStatus = $tag->promotional_status;
            $tag->updatePromotionalStatus();
            
            if ($oldStatus !== $tag->promotional_status || $force) {
                $tag->save();
                $updated++;
                
                $this->line("📝 Tag '{$tag->name}': {$oldStatus} → {$tag->promotional_status}");
            }
            
            // Contar estados
            match($tag->promotional_status) {
                'permanent' => $permanent++,
                'active' => $active++,
                'expired' => $expired++,
                default => null
            };
        }

        $this->newLine();
        $this->info("✅ Actualización completada!");
        $this->table(
            ['Estado', 'Cantidad'], 
            [
                ['🔄 Permanentes', $permanent],
                ['✅ Activos', $active],
                ['❌ Expirados', $expired],
                ['📝 Actualizados', $updated],
                ['📊 Total procesados', $tags->count()]
            ]
        );

        if ($expired > 0) {
            $this->warn("⚠️  Hay {$expired} tag(s) expirado(s). Considera revisarlos o renovar las fechas.");
        }

        if ($active > 0) {
            $this->info("🎉 Hay {$active} promoción(es) activa(s) en este momento.");
        }

        return Command::SUCCESS;
    }
}
