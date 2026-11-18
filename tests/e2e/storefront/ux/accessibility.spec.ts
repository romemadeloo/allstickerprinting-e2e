import { test, expect, gotoStorefront } from '../../../fixtures/asp-test.js';
import { Header } from '../../../pom/storefront/header.js';

test.describe('Accessibility', { tag: ['@regression', '@production'] }, () => {
  test('ASP-UX-002 header icons have accessible names', async ({ page }) => {
    // Known defect: the cart icon has no aria-label (OzStickerPrinting's says "View Cart").
    test.fail(true, 'Cart icon link #view_cart_item has no accessible name. Not yet reported.');
    const header = new Header(page);
    await gotoStorefront(page, '/');

    await expect(header.accountIcon).toHaveAccessibleName('My Account');
    await expect(header.searchIcon).toHaveAccessibleName('Search');
    await expect(header.cartIcon).toHaveAccessibleName(/cart/i);
  });
});
