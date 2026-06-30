import { test as base } from '@playwright/test';
import { Api } from '../../services';

export const test = base.extend({
  api: async ({ request }, use) => {
    const api = new Api(request);
    await use(api);
  },
});
