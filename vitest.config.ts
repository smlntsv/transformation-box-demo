import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.{ts,vue}'],
      provider: 'v8',
    },
  },
})
