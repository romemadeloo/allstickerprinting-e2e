import { test, expect } from '../../../fixtures/asp-test.js';
import { ProductConfigPage } from '../../../pom/storefront/product-config-page.js';
import { dieCut, knownDefects } from '../../../fixtures/storefront-data.js';

test.describe('Die cut configurator', { tag: ['@regression', '@production'] }, () => {
  let product: ProductConfigPage;

  test.beforeEach(async ({ page }) => {
    product = new ProductConfigPage(page);
    await product.open();
  });

  test('ASP-CFG-001 page opens with default options and a price', { tag: '@smoke' }, async () => {
    await expect(product.heading).toHaveText(dieCut.heading);
    await expect(product.summary).toHaveText(dieCut.defaults.summary);
    await expect(product.widthInput).toHaveValue(dieCut.defaults.width);
    await expect(product.heightInput).toHaveValue(dieCut.defaults.height);
    expect(await product.priceValue()).toBeGreaterThan(0);
    await expect(product.addToCartButton).toBeEnabled();
  });

  test('ASP-CFG-002 changing the finish updates the summary', async () => {
    await product.choose('Matte');

    await expect(product.summary).toContainText('/ Matte /');
  });

  test('ASP-CFG-003 a larger quantity updates the summary and raises the price', async () => {
    const basePrice = await product.priceValue();

    await product.choose(dieCut.quantities.next);

    await expect(product.summary).toContainText(`Qty : ${dieCut.quantities.next}`);
    await expect.poll(() => product.priceValue()).toBeGreaterThan(basePrice);
  });

  test('ASP-CFG-004 "See More" lists priced quantities and picking one charges the listed price', async () => {
    await product.seeMore.click();

    for (const quantity of dieCut.quantities.more) {
      await expect(product.moreQuantity(quantity), `quantity ${quantity}`).toHaveCount(1);
    }
    await expect(product.moreQuantities.last()).toHaveText(dieCut.customQuantity);

    const listed = await product.listedPrice(dieCut.quantities.pick);
    await product.moreQuantity(dieCut.quantities.pick).click();

    await expect(product.summary).toContainText(`Qty : ${dieCut.quantities.pick}`);
    await expect.poll(() => product.priceValue()).toBe(listed);
  });

  test('ASP-CFG-005 a sale shows the original price struck through above the price paid', async () => {
    test.skip((await product.originalPrice.count()) === 0, 'No sale running: no strikethrough price');
    const original = Number((await product.originalPrice.innerText()).replace(/[$,]/g, ''));

    expect(await product.priceValue()).toBeLessThan(original);
  });

  test('ASP-CFG-006 changing the size updates the summary and shape', async () => {
    await product.setSize(dieCut.sizes.valid);

    await expect(product.summary).toContainText(`Rectangle / ${dieCut.sizes.valid}x${dieCut.defaults.height}in`);
  });

  test('ASP-CFG-007 a size under the minimum shows the minimum-size message', async () => {
    await product.setSize(dieCut.sizes.tooSmall);

    await expect(product.message(dieCut.minSizeMessage)).toBeVisible();
  });

  test('ASP-CFG-008 an oversized width switches to the special-size quote', async () => {
    await product.setSize(dieCut.sizes.special);

    await expect(product.message(dieCut.specialSizeMessage)).toBeVisible();
    await expect(product.addToCartButton).toBeHidden();
  });

  test('ASP-CFG-009 switching material keeps the configurator usable', async () => {
    await product.choose('Kraft Paper');

    await expect(product.summary).toContainText('Die Cut /');
    await expect.poll(() => product.priceValue()).toBeGreaterThan(0);
    await expect(product.addToCartButton).toBeEnabled();
  });

  test('ASP-CFG-010 the quantity rule names a real divisor', async () => {
    const defect = knownDefects.quantityDivisorZero;
    test.fail(!!defect, defect.note);

    await expect(product.quantityRule).not.toContainText('divisible by 0.');
    await expect(product.quantityRule).toContainText(/divisible by [1-9]\d*\./);
  });
});
