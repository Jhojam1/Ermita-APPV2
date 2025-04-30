/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'move-1': 'moveAround1 25s ease-in-out infinite',
        'move-2': 'moveAround2 30s ease-in-out infinite',
        'move-3': 'moveAround3 35s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(0.95)' },
        },
        moveAround1: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10%, 15%) rotate(5deg)' },
          '50%': { transform: 'translate(-5%, 10%) rotate(-5deg)' },
          '75%': { transform: 'translate(5%, -10%) rotate(3deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        moveAround2: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '20%': { transform: 'translate(-10%, 5%) rotate(-3deg)' },
          '40%': { transform: 'translate(15%, 15%) rotate(6deg)' },
          '60%': { transform: 'translate(-5%, -10%) rotate(-6deg)' },
          '80%': { transform: 'translate(5%, 5%) rotate(3deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        moveAround3: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-5%, 15%) rotate(-4deg)' },
          '66%': { transform: 'translate(10%, -10%) rotate(6deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
