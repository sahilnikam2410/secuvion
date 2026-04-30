import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false, // skip gzip-size scan to speed up build
    rollupOptions: {
      output: {
        // Push large libs into their own chunks so initial route doesn't ship them
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['react-icons'],
          'vendor-pdf': ['jspdf'],
          'vendor-qr': ['html5-qrcode'],
          'vendor-email': ['@emailjs/browser', 'emailjs-com'],
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
