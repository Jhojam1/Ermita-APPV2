import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración para optimizar el rendimiento al máximo
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          ui: ['@heroicons/react'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  // Optimizaciones para el entorno de desarrollo
  server: {
    hmr: true,
    open: true
  },
  // Optimizaciones de caché
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion',
      '@heroicons/react',
      'chart.js',
      'react-chartjs-2'
    ],
    force: true
  }
})
