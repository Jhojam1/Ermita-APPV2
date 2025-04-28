/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'move-1': 'moveAround1 25s ease-in-out infinite',
        'move-2': 'moveAround2 30s ease-in-out infinite',
        'move-3': 'moveAround3 35s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        moveAround1: {
          '0%': { transform: 'translate(0%, 0%) scale(1)' },
          '20%': { transform: 'translate(50%, 30%) scale(1.1)' },
          '40%': { transform: 'translate(90%, 50%) scale(0.9)' },
          '60%': { transform: 'translate(40%, 80%) scale(1.2)' },
          '80%': { transform: 'translate(-30%, 40%) scale(0.95)' },
          '100%': { transform: 'translate(0%, 0%) scale(1)' },
        },
        moveAround2: {
          '0%': { transform: 'translate(0%, 0%) scale(1)' },
          '20%': { transform: 'translate(-40%, 30%) scale(1.15)' },
          '40%': { transform: 'translate(-80%, -40%) scale(0.9)' },
          '60%': { transform: 'translate(-30%, -70%) scale(1.1)' },
          '80%': { transform: 'translate(50%, -30%) scale(0.95)' },
          '100%': { transform: 'translate(0%, 0%) scale(1)' },
        },
        moveAround3: {
          '0%': { transform: 'translate(0%, 0%) scale(1)' },
          '20%': { transform: 'translate(30%, -50%) scale(1.1)' },
          '40%': { transform: 'translate(70%, -20%) scale(0.9)' },
          '60%': { transform: 'translate(20%, -80%) scale(1.2)' },
          '80%': { transform: 'translate(-40%, -40%) scale(0.95)' },
          '100%': { transform: 'translate(0%, 0%) scale(1)' },
        },
        float: {
          '0%': { transform: 'translatey(0px) scale(1)' },
          '50%': { transform: 'translatey(-20px) scale(1.1)' },
          '100%': { transform: 'translatey(0px) scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
