import React from 'react';
import { Loader2 } from 'lucide-react';

const ButtonPrimary = ({ children, className = '', loading = false, disabled = false, ...props }) => {
    return (
        <button
            type="button"
            disabled={disabled || loading}
            className={`w-full bg-primary font-bold text-white py-3 px-4 hover:opacity-90 hover:shadow-md transition-all duration-300 focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
};

export default ButtonPrimary;
