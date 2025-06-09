<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Notifications\MessageContactNotification;
use Illuminate\Http\Request;

class MessageController extends BasicController
{
    public $model = Message::class;

    public function beforeSave(Request $request): array
    {
        $messages = [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'email.email' => 'El correo electrónico debe tener el formato user@domain.com.',
            'email.max' => 'El correo electrónico no debe exceder los 320 caracteres.',
            'subject.required' => 'El asunto es obligatorio.',
            'subject.string' => 'El asunto debe ser una cadena de texto.',
            'description.required' => 'El mensaje es obligatorio.',
            'description.string' => 'El mensaje debe ser una cadena de texto.'
        ];

        // Validación de los datos
        $validatedData = $request->validate([
            'name' => 'required|string',
            'email' => 'nullable|email|max:320',
            'phone' => 'numeric',
            'subject' => 'string',
            'description' => 'string',
            // 'subject' => 'required|string',
            // 'description' => 'required|string',
        ], $messages);

        return $validatedData;
    }

    public function afterSave(Request $request, object $jpa, ?bool $isNew)
    {
        //MailingController::notifyContact($jpa);
        $jpa->notify(new MessageContactNotification($jpa));
    }
}
