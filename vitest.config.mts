import { defineConfig } from 'vitest/config';
import { name } from './package.json';

export default defineConfig({
  test: {
    name,
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*'],
    },
  },
});
