// Admin panel copy and data. The panel has no test ids; copy here, locators in tests/pom/admin.

export const adminLogin = {
  title: 'AllStickerPrinting | Admin Panel',
  logoAlt: 'logo',
  placeholders: { email: 'Email Address', password: 'Password' },
  rememberMe: 'Keep me signed in',
  submit: 'LOG IN',
  errors: { invalidEmail: 'Invalid Email Address.' },
  // Reserved domain: never a real account. Used only for typing, never submitted on production.
  sample: { email: 'qa-e2e-nobody@example.com', password: 'Secret123!' }
} as const;

/** Pages that need a session: opening them logged out must land on the login form. */
export const guardedAdminPaths = ['/orders', '/orders/1', '/dashboard', '/members'] as const;
