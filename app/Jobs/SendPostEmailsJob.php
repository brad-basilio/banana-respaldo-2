<?php

namespace App\Jobs;

use App\Models\Post;
use App\Models\Subscription;
use App\Notifications\BlogPublishedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPostEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected  $jpa;
    /**
     * Create a new job instance.
     */
    public function __construct($jpa)
    {
        $this->jpa = $jpa;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
       try {
            $subscriptions = Subscription::where('status', true)->get();
            foreach ($subscriptions as $subscription) {
                $subscription->notify(new BlogPublishedNotification($this->jpa));
            }
        } catch (\Throwable $th) {
            dump('Error al enviar notificaciones de blog publicado: ' . $th->getMessage());
        }
    }
}
