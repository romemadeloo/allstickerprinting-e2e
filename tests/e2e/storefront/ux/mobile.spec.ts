import { test, expect, gotoStorefront } from '../../../fixtures/asp-test.js';
import { Header } from '../../../pom/storefront/header.js';
import { nav } from '../../../fixtures/storefront-data.js';

test.describe('Mobile layout', { tag: ['@mobile', '@smoke', '@production'] }, () => {
  test('ASP-MOB-001 home page fits the phone width without horizontal scroll', async ({ page }) => {
    await gotoStorefront(page, '/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('ASP-MOB-002 hamburger menu reveals the main navigation', async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/');

    await header.mobileMenuToggle.click();

    await expect(header.navLink(nav.primary[0].mobileName)).toBeVisible();
    await header.navLink(nav.primary[0].mobileName).click();
    await expect(page).toHaveURL((url) => url.pathname === nav.primary[0].path);
  });
});
