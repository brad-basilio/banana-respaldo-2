<?php

namespace App\Http\Controllers;

use App\Http\Classes\EmailConfig;
use App\Http\Services\ReCaptchaService;
use App\Models\Constant;
use App\Models\ModelHasRoles;
use App\Models\User;
use App\Models\Person;
use App\Models\PreUser;
use App\Models\SpecialtiesByUser;
use App\Models\Specialty;
use App\Notifications\PasswordChangedNotification;
use App\Notifications\VerifyAccountNotification;
use App\Providers\RouteServiceProvider;
use App\Services\EmailNotificationService;
use Exception;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use SoDe\Extend\Crypto;
use SoDe\Extend\JSON;
use SoDe\Extend\Response;
use SoDe\Extend\Trace;
use Spatie\Permission\Models\Role;

class AuthClientController extends BasicController
{

    public function validarEmail($email)
    {
        $regex = "/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/";
        return preg_match($regex, $email) === 1;
    }

    public function login(Request $request): HttpResponse | ResponseFactory | RedirectResponse
    {
        //dump($request->all());

        $response = Response::simpleTryCatch(function (Response $response) use ($request) {
            $email = Controller::decode($request->email);
            $password = Controller::decode($request->password);

            if (!Auth::attempt(['email' => $email, 'password' => $password])) {

                $response->status = 400;
                $response->message = 'Operación Incorrecta. Por favor, ingresar credenciales válidas';
                return;
            }

            // 🔴 Regenerar sesión
            $request->session()->regenerate();

            // ✅ Agregar usuario autenticado a la respuesta
            $response->status = 200;
            $response->message = 'Operación Correcta. Has iniciado sesión';
            $response->data = [
                'user' => Auth::user(),
            ];
        });

        //dump($response->toArray(), $response->status);
        return response($response->toArray(), $response->status);
    }

    public function signup(Request $request): HttpResponse | ResponseFactory
    {
        $response = new Response();
        try {
            $email = Controller::decode($request->email);
            $password = Controller::decode($request->password);
            $confirmation = Controller::decode($request->confirmation);
            $name = Controller::decode($request->name);
            $lastname = Controller::decode($request->lastname);

            // Validar contraseñas
            if ($password !== $confirmation) {
                $response->status = 400;
                $response->message = 'Las contraseñas no coinciden.';
                return response($response->toArray(), $response->status);
            }

            // Validar formato email
            if (!$this->validarEmail($email)) {
                $response->status = 400;
                $response->message = 'Correo electrónico inválido.';
                return response($response->toArray(), $response->status);
            }

            // Verificar email único
            if (User::where('email', $email)->exists()) {
                $response->status = 400;
                $response->message = 'El correo ya está registrado.';
                return response($response->toArray(), $response->status);
            }

            // Crear usuario
            $user = User::create([
                'name' => $name,
                'lastname' => $lastname,
                'email' => $email,
                'password' => bcrypt($password),
                'email_verified_at' => now(), // O null si requiere confirmación
            ]);

            // Enviar correo de bienvenida
            $notificationService = new EmailNotificationService();
            $notificationService->sendToUser($user, new VerifyAccountNotification(url('/')));

            // Asignar rol
            $role = Role::firstOrCreate(['name' => 'Customer']);
            $user->assignRole($role);
            



            // Iniciar sesión (opcional)
            Auth::login($user);

            $response->status = 200;
            $response->message = 'Usuario registrado exitosamente.';
            $response->data = ['user' => $user];
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = $th->getMessage();
        }

        return response($response->toArray(), $response->status);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        $response = new Response();
        try {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $response->status = 200;
            $response->message = 'Cierre de sesion exitoso';
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        } finally {
            return response(
                $response->toArray(),
                $response->status
            );
        }
    }

    public function forgotPassword(Request $request): HttpResponse | ResponseFactory
    {
        $response = new Response();
        try {
            // Validar el correo electrónico
            $request->validate([
                'email' => 'required',
            ]);

            if (!$this->validarEmail(Controller::decode($request->email))) {
                $response->status = 400;
                $response->message = 'Operación Incorrecta. Por favor, ingresa un correo electrónico válido.';
            }
            // Buscar al usuario por correo electrónico
            $user = User::where('email', Controller::decode($request->email))->first();
            if (!$user) {
                $response->status = 400;
                $response->message = 'Operación Incorrecta. No se encontró ningún usuario con este correo electrónico.';
            }

            // Generar un token único para restablecer la contraseña
            $token = Password::createToken($user);

            // Enviar correo con el enlace de restablecimiento
            $resetUrl = env('APP_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
            // $resetUrl = env('APP_URL') . '/reset-password?token=' . $token;

            // Renderizar la plantilla Blade
            $content = View::make('emails.reset_password', ['RESET_URL' => $resetUrl])->render();

            // Enviar notificación con el link de restablecimiento de contraseña
            $notificationService = new EmailNotificationService();
            $notificationService->sendToUser($user, new \App\Notifications\PasswordResetLinkNotification($resetUrl));
            //dump($mailer);
            // Respuesta exitosa
            $response->status = 200;
            $response->message = 'Se ha enviado un enlace para restablecer tu contraseña.';
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        } finally {
            return response(
                $response->toArray(),
                $response->status
            );
        }
    }

    public function resetPassword(Request $request): HttpResponse | ResponseFactory
    {
        $response = new Response();
        //dump($request->all());
        try {
            // Validar los datos de entrada
            $request->validate([
                'email' => 'required|string',
                'token' => 'required|string',
                'password' => 'required|string',
                'confirmation' => 'required|string',
            ]);
            // Verificar que las contraseñas coincidan
            if (Controller::decode($request->password) !== Controller::decode($request->confirmation)) {
                $response->status = 400;
                $response->message = 'Operación Incorrecta. Por favor, las contraseñas deben ser iguales';
            }
            // Restablecer la contraseña usando Laravel Password Broker
            $status = Password::reset(
                [
                    'email' => Controller::decode($request->email),
                    'password' => Controller::decode($request->password),
                    'password_confirmation' => Controller::decode($request->password_confirmation),
                    'token' => $request->token,
                ],
                function ($user, $password) {

                    $user->forceFill([
                        'password' => bcrypt($password),
                        'remember_token' => null,
                    ])->save();
                }
            );
            //dump($status);

            if ($status === Password::PASSWORD_RESET) {
                // Enviar notificación de contraseña restablecida
                $user = User::where('email', Controller::decode($request->email))->first();
                if ($user) {
                    $notificationService = new EmailNotificationService();
                    $notificationService->sendToUser($user, new PasswordChangedNotification());
                }
                $response->status = 200;
                $response->message = 'Contraseña restablecida correctamente.';
            } else {
                throw new Exception('Error al restablecer la contraseña.');
            }
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        } finally {
            return response(
                $response->toArray(),
                $response->status
            );
        }
    }
}
