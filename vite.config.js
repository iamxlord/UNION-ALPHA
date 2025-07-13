// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // THE FIX IS HERE: Set the root to the directory where your index.html is located.
  // Since index.html is in 'public', the root should be 'public'.
  root: './public', // <--- CHANGE THIS LINE
  build: {
    // The output directory for the build. Defaults to 'dist'.
    // NOTE: When root is set to './public', outDir will be 'public/dist' by default,
    // so we want to explicitly set it to '../dist' to put it back at the project root level.
    outDir: '../dist', // <--- CHANGE THIS LINE (relative to the new 'root')
  },
  server: {
    host: '0.0.0.0', // Makes it accessible from outside localhost
    port: 5173,
  },
});
