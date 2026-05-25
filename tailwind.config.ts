import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0a',
        chalk: '#f5f5f0',
        accent: '#9b7fe8',
        muted: '#888888',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
