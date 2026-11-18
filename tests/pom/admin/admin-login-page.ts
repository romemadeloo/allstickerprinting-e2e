import type { Locator, Page } from '@playwright/test';
import { adminLogin } from '../../fixtures/admin-data.js';
import { adminUrl } from '../../fixtures/env.js';

/** Admin panel login form (admin-panel-v2). The panel has no test ids. */
export class AdminLoginPage {
  readonly form: Locator;
  readonly logo: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPassword: Locator;
  readonly rememberMe: Locator;
  readonly submitButton: Locator;
  /**
   * The wrapper around LOG IN. While the form is incomplete it carries `disabled` and the button gets
   * `pointer-events: none`; the button itself never gets a `disabled` attribute.
   */
  readonly submitWrapper: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.login');
    this.logo = page.getByRole('img', { name: adminLogin.logoAlt });
    this.emailInput = page.getByPlaceholder(adminLogin.placeholders.email);
    this.passwordInput = page.getByPlaceholder(adminLogin.placeholders.password);
    this.showPassword = this.form.locator('a.show_password');
    this.rememberMe = page.getByText(adminLogin.rememberMe);
    this.submitButton = page.getByRole('button', { name: adminLogin.submit });
    this.submitWrapper = this.form.locator('div.buttons.login');
  }

  async goto(path = '/') {
    await this.page.goto(adminUrl(path), { waitUntil: 'load' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await this.emailInput.waitFor();
  }

  async isSubmitActive(): Promise<boolean> {
    const wrapperDisabled = await this.submitWrapper.evaluate((element) => element.classList.contains('disabled'));
    const pointerEvents = await this.submitButton.evaluate((element) => getComputedStyle(element).pointerEvents);
    return !wrapperDisabled && pointerEvents !== 'none';
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
