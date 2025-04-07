// tailwind.config.ts
import type { Config } from 'tailwindcss'


const config: Config = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00ffcc',
                secondary: '#ff00aa',
                dark: '#111111',
            },
            fontFamily: {
                title: ["Noto Sans", "sans-serif"],
                body: ["DM Sans", "sans-serif"],
            },
        },
    },
    plugins: [],
}

export default config
