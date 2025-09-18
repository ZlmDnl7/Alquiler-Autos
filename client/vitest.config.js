import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      threshold: {
        global: {
          branches: 85,
          functions: 100,
          lines: 85,
          statements: 85
        }
      },
      include: [
        'src/utils/**/*.{js,jsx}',
      ],
      exclude: [
        'src/tests/**',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/main.jsx',
        'src/index.js',
        'src/theme.js',
        'src/firebase.js'
      ]
    }
  }
})
