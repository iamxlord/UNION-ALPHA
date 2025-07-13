// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This 'root' should point to the directory where your 'public' folder and 'src' folder reside.
  // In your case, it's the project root itself.
  root: './',
  build: {
    // The output directory for the build. Defaults to 'dist'.
    outDir: 'dist',
    // REMOVE THIS BLOCK ENTIRELY, Vite handles index.html injection by default
    // rollupOptions: {
    //   input: {
    //     main: './public/index.html'
    //   }
    // }
  },
  server: {
    host: '0.0.0.0', // Makes it accessible from outside localhost
    port: 5173,
  },
});
