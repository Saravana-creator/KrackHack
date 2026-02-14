/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#60a5fa', // Blue 400
                    DEFAULT: '#3b82f6', // Blue 500
                    dark: '#1d4ed8', // Blue 700
                },
                secondary: {
                    light: '#818cf8', // Indigo 400
                    DEFAULT: '#6366f1', // Indigo 500
                    dark: '#4338ca', // Indigo 700
                },
                accent: {
                    teal: '#14b8a6',
                    purple: '#a855f7',
                },
                background: {
                    DEFAULT: '#0f172a', // Slate 900
                    paper: '#1e293b',   // Slate 800
                },
                text: {
                    primary: '#f8fafc', // Slate 50
                    secondary: '#cbd5e1', // Slate 300
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
