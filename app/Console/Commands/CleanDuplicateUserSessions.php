<?php

namespace App\Console\Commands;

use App\Models\UserSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanDuplicateUserSessions extends Command
{
    protected $signature = 'sessions:clean-duplicates
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--limit=1000 : Limit the number of records to process per batch}';

    protected $description = 'Clean duplicate user sessions to resolve connection issues';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $this->info('🔍 Analyzing duplicate user sessions...');

        // Encontrar sesiones duplicadas por session_id
        $duplicates = DB::select("
            SELECT session_id, COUNT(*) as count 
            FROM user_sessions 
            GROUP BY session_id 
            HAVING COUNT(*) > 1 
            ORDER BY count DESC
            LIMIT {$limit}
        ");

        if (empty($duplicates)) {
            $this->info('✅ No duplicate sessions found!');
            return 0;
        }

        $totalDuplicates = count($duplicates);
        $totalRecordsToDelete = array_sum(array_map(fn($d) => $d->count - 1, $duplicates));

        $this->warn("📊 Found {$totalDuplicates} session groups with duplicates");
        $this->warn("🗑️  Total records to clean: {$totalRecordsToDelete}");

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - Showing what would be deleted:');
            
            foreach (array_slice($duplicates, 0, 10) as $duplicate) {
                $sessions = UserSession::where('session_id', $duplicate->session_id)
                    ->orderBy('created_at')
                    ->get();
                
                $this->line("Session ID: {$duplicate->session_id} ({$duplicate->count} records)");
                foreach ($sessions->skip(1) as $session) {
                    $this->line("  - Would delete: ID {$session->id}, Created: {$session->created_at}");
                }
            }
            
            $this->info("\n💡 Run without --dry-run to actually clean the duplicates");
            return 0;
        }

        if (!$this->confirm("Are you sure you want to delete {$totalRecordsToDelete} duplicate records?")) {
            $this->info('❌ Operation cancelled');
            return 1;
        }

        $deletedCount = 0;
        $progressBar = $this->output->createProgressBar($totalDuplicates);
        $progressBar->start();

        foreach ($duplicates as $duplicate) {
            try {
                // Mantener solo el registro más antiguo (primer registro creado)
                $sessions = UserSession::where('session_id', $duplicate->session_id)
                    ->orderBy('created_at')
                    ->get();

                // Eliminar todos excepto el primero
                $toDelete = $sessions->skip(1);
                
                foreach ($toDelete as $session) {
                    $session->delete();
                    $deletedCount++;
                }

                $progressBar->advance();
            } catch (\Exception $e) {
                $this->error("Error processing session {$duplicate->session_id}: " . $e->getMessage());
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully cleaned {$deletedCount} duplicate session records!");
        
        // Estadísticas finales
        $totalSessions = UserSession::count();
        $this->info("📊 Total user sessions remaining: {$totalSessions}");

        return 0;
    }
}
