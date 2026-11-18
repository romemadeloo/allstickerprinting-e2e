import { test, expect, gotoStorefront } from '../../../fixtures/asp-test.js';
import { redirects } from '../../../fixtures/storefront-data.js';

test.describe('Redirects', { tag: ['@regression', '@production'] }, () => {
  for (const [index, redirect] of redirects.entries()) {
    const id = `ASP-RDR-${String(index + 1).padStart(3, '0')}`;

    test(`${id} ${redirect.from} redirects to ${redirect.to}`, async ({ page }) => {
      const response = await gotoStorefront(page, redirect.from);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL((url) => url.pathname === redirect.to);
    });
  }
});
