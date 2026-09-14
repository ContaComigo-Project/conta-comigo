import { test as base, expect } from '@playwright/test';
import { setupMockApi } from './mock-api';

/**
 * Fixture do Playwright com interceptador de API habilitado por padrão (ADR-003).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockApi(page);
    await use(page);
  },
});

export { expect };
