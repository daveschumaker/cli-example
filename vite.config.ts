import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enables global test APIs like describe, it, expect
    environment: 'node' // Use the node environment for testing CLI/Ink apps
    // You can add further Vitest options here, e.g., include/exclude patterns
  }
});
