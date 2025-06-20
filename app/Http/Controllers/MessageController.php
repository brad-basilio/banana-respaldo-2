<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Notifications\MessageContactNotification;
use App\Helpers\NotificationHelper;
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
        try {
            // Enviar notificación al cliente y al administrador
            NotificationHelper::sendToClientAndAdmin($jpa, new MessageContactNotification($jpa));
        } catch (\Exception $e) {
            \Log::error('MessageController - Error enviando notificaciones', [
                'error' => $e->getMessage(),
                'message_id' => $jpa->id ?? 'unknown'
            ]);
            // No lanzamos la excepción para no interrumpir el flujo del guardado
        }
    }
}
