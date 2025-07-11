/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./resources/**/*.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                "font-general": ["Lato", "serif"], //"Lato" "serif" usado para Sala Fabulosa
                "font-primary": ["Rajdhani", "sans-serif"], // usado para Stech Peru
                "font-secondary": ["Open Sans", "serif"],
            },
            colors: {
                primary: {
                    DEFAULT: "#0f62fe", // Color azul moderno
                    50: "#eff6ff",
                    100: "#dbeafe", 
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#0f62fe", // Primary
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                
                neutral: {
                    dark: "#1f2937",
                    light: "#f9fafb"
                },
                
            },
            margin: {
                primary: "5%",
            },
            padding: {
                primary: "5%",
            },
            objectPosition: {
                "right-25": "75% center", // Esto desplaza la imagen 75% a la derecha y la centra verticalmente
                "right-10": "90% center", // Esto desplaza la imagen 90% a la derecha y la centra verticalmente
            },
            fontStyle: {
                'oblique-light': 'oblique 5deg',
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("tailwindcss-animated"),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        // require('tailwind-scrollbar')({
        //     nocompatible: true,
        //     preferredStrategy: 'pseudoelements',
        // }),
        // Otros plugins si los tienes
    ],
    
};
