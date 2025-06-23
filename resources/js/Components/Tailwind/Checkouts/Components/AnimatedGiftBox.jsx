import { Gift, Sparkles } from "lucide-react";

export default function AnimatedGiftBox({ onClick, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            {/* Sparkles around the gift */}
            <Sparkles 
                size={12} 
                className="absolute -top-1 -left-1 text-yellow-400 animate-ping" 
                style={{ animationDelay: '0s' }}
            />
            <Sparkles 
                size={10} 
                className="absolute -top-2 -right-1 text-pink-400 animate-ping" 
                style={{ animationDelay: '0.5s' }}
            />
            <Sparkles 
                size={8} 
                className="absolute -bottom-1 -left-2 text-blue-400 animate-ping" 
                style={{ animationDelay: '1s' }}
            />
            <Sparkles 
                size={14} 
                className="absolute -bottom-2 -right-2 text-purple-400 animate-ping" 
                style={{ animationDelay: '1.5s' }}
            />
            
            {/* Main gift box */}
            <button
                onClick={onClick}
                className="relative group bg-primary p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce cursor-pointer"
                style={{ 
                    animationDuration: '2s',
                    animationIterationCount: 'infinite'
                }}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg"></div>
                
                {/* Gift icon */}
                <Gift size={24} className="text-white relative z-10 drop-shadow-sm" />
                
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-primary rounded-xl animate-pulse opacity-30"></div>
            </button>
            
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                ¡Promoción disponible!
            </div>
        </div>
    );
}
