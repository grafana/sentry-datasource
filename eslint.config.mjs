import { defineConfig } from 'eslint/config';
import baseConfig from './.config/eslint.config.mjs';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/coverage/',
      'coverage/**/*',
      'cypress/report.json',
      'cypress/screenshots/actual',
      'cypress/videos/',
      '**/dev/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.cache/',
      'playwright/.auth/',
    ],
  },
  ...baseConfig,
]);
