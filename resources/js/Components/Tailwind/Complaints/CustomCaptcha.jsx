import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';

const CustomCaptcha = forwardRef(({ onVerify, error }, ref) => {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');

    // Función para generar un token único
    const generateToken = () => {
        return 'captcha_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    // Función para generar texto aleatorio del captcha
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(result);
        setUserInput('');
        setIsVerified(false);
        
        // Generar nuevo token
        const newToken = generateToken();
        setCaptchaToken(newToken);
        
        onVerify(false, null);
    };

    // Exponer la función reset al componente padre
    useImperativeHandle(ref, () => ({
        reset: generateCaptcha
    }));

    // Generar captcha inicial
    useEffect(() => {
        generateCaptcha();
    }, []);

    // Verificar input del usuario
    const handleInputChange = (e) => {
        const value = e.target.value;
        setUserInput(value);
        
        if (value.toLowerCase() === captchaText.toLowerCase()) {
            setIsVerified(true);
            // Enviar tanto el estado como el token
            onVerify(true, captchaToken);
        } else {
            setIsVerified(false);
            onVerify(false, null);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium customtext-neutral-dark mb-2">
                Verificación de seguridad
            </label>
            <div className='flex gap-4  items-center'>
 {/* Canvas del captcha */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div 
                        className="bg-gray-100 border-2 border-gray-300 rounded-lg px-6 py-4 font-mono text-2xl font-bold customtext-neutral-dark tracking-wider select-none"
                        style={{
                            background: 'linear-gradient(45deg, #f0f9ff 0%, #e0e7ff 50%, #f0f9ff 100%)',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            letterSpacing: '4px'
                        }}
                    >
                        {captchaText}
                    </div>
                    
                    {/* Líneas de ruido visual */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="10" y1="20" x2="90" y2="30" stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
                            <line x1="20" y1="80" x2="80" y2="70" stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
                            <line x1="0" y1="50" x2="100" y2="45" stroke="#94a3b8" strokeWidth="1" opacity="0.2"/>
                        </svg>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 group"
                    title="Generar nuevo código"
                >
                    <RefreshCw className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-300" />
                </button>
            </div>
            <div className='w-full'>
 {/* Input del usuario */}
            <div className="relative w-full">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Ingresa el código que ves arriba"
                    className={`w-full px-4 py-3 border rounded-xl font-mono text-lg tracking-wider focus:ring-2 focus:outline-none transition-all duration-300 ${
                        isVerified 
                            ? 'border-primary  customtext-primary ' 
                            : error 
                            ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-300 focus:ring-blue-200'
                    }`}
                />
                
                {/* Indicador visual */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isVerified && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {error}
                </p>
            )}
            </div>
            </div>
           

           

            {/* Información adicional */}
            <p className="text-xs customtext-neutral-light">
                Ingresa exactamente el código que aparece arriba. No distingue entre mayúsculas y minúsculas.
            </p>
        </div>
    );
});

export default CustomCaptcha;