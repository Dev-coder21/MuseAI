import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Pre-bundle together so motion and the app share one copy of React.
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client', 'motion/react'] },
  resolve: { dedupe: ['react', 'react-dom'] },
})
