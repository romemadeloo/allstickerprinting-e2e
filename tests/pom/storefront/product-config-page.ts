import type { Locator, Page } from '@playwright/test';
import { dieCut } from '../../fixtures/storefront-data.js';
import { gotoStorefront } from '../../fixtures/asp-test.js';

/**
 * Product configurator (material, size in inches, shape, finish, adhesive, quantity, price, add to cart).
 * Everything is scoped to the `.quote_form` panel: the page also has a special-size quote form with
 * its own width/height inputs.
 */
export class ProductConfigPage {
  readonly heading: Locator;
  readonly form: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly summary: Locator;
  readonly priceHolder: Locator;
  readonly originalPrice: Locator;
  readonly addToCartButton: Locator;
  readonly quantityRule: Locator;
  readonly seeMore: Locator;
  readonly moreQuantities: Locator;
  readonly artworkModal: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.form = page.locator('form.quote_form');
    this.widthInput = page.getByPlaceholder('width (in)');
    this.heightInput = page.getByPlaceholder('height (in)');
    // The one-line order summary, e.g. "Die Cut / Square / 1.2x1.2in / Gloss / Normal / Qty : 100".
    this.summary = page.getByText(/\/ Qty : \d+/).first();
    // "<em class=strikethrough>$34.00</em> $28.00" during a sale, or just "$34.00".
    this.priceHolder = page.getByText(dieCut.totalPrice, { exact: true }).locator('xpath=..').locator('.price_holder');
    this.originalPrice = this.priceHolder.locator('em.strikethrough');
    this.addToCartButton = page.getByRole('button', { name: dieCut.addToCart });
    this.quantityRule = page.getByText(dieCut.quantityRule).first();
    this.seeMore = this.form.getByText(dieCut.seeMore, { exact: true }).first();
    this.moreQuantities = this.seeMore.locator('xpath=ancestor::div[contains(@class,"radio_group")]').locator('ul.drop_values > li');
    this.artworkModal = page.locator('.up_artwork_modal');
  }

  /**
   * Opens a product page and waits for its own pricing. Until /api/get/pricing-data answers, the
   * panel shows placeholder values (Qty 10, $0.00).
   */
  async open(path: string = dieCut.path) {
    const pricing = this.page.waitForResponse((response) => response.url().includes('/api/get/pricing-data'));
    await gotoStorefront(this.page, path);
    await pricing;
    await this.widthInput.waitFor();
    await this.page.waitForFunction(() => /\$[1-9][\d,]*\.\d{2}/.test(document.querySelector('.price_holder')?.textContent ?? ''));
  }

  /** An option chip (material, finish, adhesive, quantity) by its exact label, inside the form. */
  option(label: string): Locator {
    return this.form.getByText(label, { exact: true }).first();
  }

  async choose(label: string) {
    const before = await this.summary.innerText();
    await this.option(label).click();
    await this.page
      .waitForFunction(([text]) => !document.body.innerText.includes(text), [before], { timeout: 10_000 })
      .catch(() => undefined);
  }

  async setSize(width: string, height?: string) {
    await this.widthInput.fill(width);
    await this.widthInput.press('Tab');
    if (height !== undefined) {
      await this.heightInput.fill(height);
      await this.heightInput.press('Tab');
    }
  }

  /** The price the customer pays: the sale price when there is a strikethrough, else the only price. */
  async priceValue(): Promise<number> {
    const text = await this.priceHolder.evaluate((holder) =>
      [...holder.childNodes]
        .filter((node) => !(node instanceof HTMLElement && node.classList.contains('strikethrough')))
        .map((node) => node.textContent ?? '')
        .join('')
    );
    const match = text.match(/\$([\d,]+\.\d{2})/);
    return match ? Number(match[1].replace(/,/g, '')) : NaN;
  }

  /** A row of the "See More" list: "<qty> $<price> <n>%off". */
  moreQuantity(quantity: string): Locator {
    return this.moreQuantities.and(this.page.locator(`[data-value="${quantity}"]`));
  }

  async listedPrice(quantity: string): Promise<number> {
    const text = await this.moreQuantity(quantity).locator('.custom_li span').innerText();
    return Number(text.replace(/[$,]/g, ''));
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true }).first();
  }
}
