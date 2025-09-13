import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/config/setupTests.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['tests-examples/**', 'tests-e2e/**'],
    },
})