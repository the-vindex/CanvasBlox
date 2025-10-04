import path from 'node:path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        runtimeErrorOverlay(),
        ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
            ? [
                  await import('@replit/vite-plugin-cartographer').then((m) => m.cartographer()),
                  await import('@replit/vite-plugin-dev-banner').then((m) => m.devBanner()),
              ]
            : []),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'client', 'src'),
            '@shared': path.resolve(import.meta.dirname, 'shared'),
            '@assets': path.resolve(import.meta.dirname, 'attached_assets'),
        },
    },
    optimizeDeps: {
        exclude: ['@playwright/test', 'playwright', 'playwright-core'],
    },
    root: path.resolve(import.meta.dirname, 'client'),
    build: {
        outDir: path.resolve(import.meta.dirname, 'dist/public'),
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ['**/.*'],
        },
    },
});
