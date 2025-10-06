import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./client/vitest.setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
        // Dot reporter: Minimal output - shows dots for passing tests, details for failures
        // Optimized for AI agents: Reduces token consumption by ~90% vs default reporter
        // Output: ....F.. (dots for pass, F for fail) + failure details + summary
        reporter: 'dot',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src'),
        },
    },
});
