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
    private Post $jpa;
    /**
     * Create a new job instance.
     */
    public function __construct(Post $jpa)
    {
        $this->jpa = $jpa;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $subscribers = Subscription::all();

        foreach ($subscribers as $subscriber) {
            $subscriber->notify(new BlogPublishedNotification($this->jpa));
        }
    }
}
