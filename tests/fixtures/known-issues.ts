// Known product issues that would otherwise fail the page guard in asp-test.ts.
// Each entry needs a note and, once filed, a ticket key. Remove the entry when the defect is fixed,
// so a regression fails again. Never widen a pattern to hide a new problem.

export type KnownIssue = {
  /** Matched against the console text or "<status> <url>". */
  match: RegExp;
  /** Limits the allowance to pages whose URL matches. Omit for site-wide. */
  onPage?: RegExp;
  note: string;
  ticket?: string;
};

export const knownIssues: KnownIssue[] = [
  {
    // Opening the admin panel without a session makes it call admin/signout, which answers 401
    // (there is no session to end) and logs "Failed to load resource". Harmless, but noisy.
    match: /^401 .*\/api\/admin\/signout$/,
    onPage: /admin-panel/,
    note: 'Logged-out admin panel calls admin/signout and gets 401. Not yet reported.'
  }
];

/** Mutating API calls that are safe on production (they write nothing). */
export const productionWriteAllowlist: RegExp[] = [
  // Failed sign-in with a reserved example.com address: returns {status:"FAIL"} and creates nothing.
  /\/api\/security\/soft-login$/,
  // Called right after a failed soft-login; for an unknown account it only returns an error.
  /\/api\/user\/signin$/,
  // Page metadata lookup the storefront makes with POST on client-side navigation; read-only.
  /\/api\/site\/seo$/,
  // Redirect lookup the storefront makes with POST for an unknown URL before showing the 404 page.
  /\/api\/site\/redirect$/,
  // The logged-out admin panel ends a session that doesn't exist (401); nothing is written.
  /\/api\/admin\/signout$/
];
