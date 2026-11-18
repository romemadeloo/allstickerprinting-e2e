import { test, expect } from '../../../fixtures/asp-test.js';
import { AdminLoginPage } from '../../../pom/admin/admin-login-page.js';
import { adminLogin, guardedAdminPaths } from '../../../fixtures/admin-data.js';

// Read-only on purpose: these cases never press LOG IN with credentials, so no login attempt (and no
// verification email) reaches the production admin API.
test.describe('Admin login', { tag: ['@admin', '@regression', '@production'] }, () => {
  let login: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    login = new AdminLoginPage(page);
    await login.goto();
  });

  test('ASP-ADMA-001 login page shows the sign-in form', { tag: '@smoke' }, async ({ page }) => {
    await expect(page).toHaveTitle(adminLogin.title);
    await expect(login.logo).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
    await expect(login.rememberMe).toBeVisible();
    await expect(login.submitButton).toBeVisible();
  });

  test('ASP-ADMA-002 LOG IN stays inactive until email and password are both filled', async () => {
    expect(await login.isSubmitActive(), 'empty form').toBe(false);

    await login.emailInput.fill(adminLogin.sample.email);
    expect(await login.isSubmitActive(), 'email only').toBe(false);

    await login.passwordInput.fill(adminLogin.sample.password);
    await expect.poll(() => login.isSubmitActive(), { message: 'email and password' }).toBe(true);
  });

  test('ASP-ADMA-003 a malformed email shows "Invalid Email Address."', async () => {
    await login.emailInput.fill('not-an-email');

    await expect(login.message(adminLogin.errors.invalidEmail)).toBeVisible();
  });

  test('ASP-ADMA-004 the eye icon reveals the password', async () => {
    await login.passwordInput.fill(adminLogin.sample.password);

    await login.showPassword.click();

    await expect(login.passwordInput).toHaveAttribute('type', 'text');
  });
});

test.describe('Admin route guard', { tag: ['@admin', '@regression', '@production'] }, () => {
  for (const [index, path] of guardedAdminPaths.entries()) {
    test(`ASP-ADMA-${String(index + 5).padStart(3, '0')} logged-out visit to ${path} shows the login form`, async ({ page }) => {
      const login = new AdminLoginPage(page);

      await login.goto(path);

      await expect(page).toHaveURL((url) => url.pathname === '/');
      await expect(login.submitButton).toBeVisible();
    });
  }
});
