<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Message extends Model
{
    use HasFactory, HasUuids, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
        'description',
        'seen',
        'status',
    ];
    /**
     * Route notifications for the mail channel.
     *
     * @return string
     */
    public function routeNotificationForMail($notification)
    {
        return $this->email;
    }
}
