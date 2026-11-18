# Writing and changing tests

These rules keep the suite readable, safe against production, and in step with the test case list.
They follow the `musticker-playwright` conventions, with the `ASP` prefix.

- [Test case IDs](#test-case-ids)
- [Where a test goes](#where-a-test-goes)
- [Anatomy of a spec](#anatomy-of-a-spec)
- [Tags](#tags)
- [Locators and assertions](#locators-and-assertions)
- [Data, safety and cleanup](#data-safety-and-cleanup)
- [Known defects and preconditions](#known-defects-and-preconditions)
- [Keeping the case list current](#keeping-the-case-list-current)
- [Pull request checklist](#pull-request-checklist)

## Test case IDs

Every test title starts with its case ID: `ASP-<MODULE>-###`. The same ID is used in
[TEST-CASES.md](TEST-CASES.md), commit messages and defect reports.

| Prefix | Module | Example |
| --- | --- | --- |
| `ASP-NAV-###` | Public pages | `ASP-NAV-003 /stickers/die-cut loads with its heading and title` |
| `ASP-RDR-###` | Redirects | `ASP-RDR-001 /stickers redirects to /custom/stickers` |
| `ASP-HDR-###` | Header navigation | `ASP-HDR-005 logo returns to the home page` |
| `ASP-FTR-###` | Footer | `ASP-FTR-002 footer shows the contact email as a mailto link` |
| `ASP-SRCH-###` | Search | `ASP-SRCH-003 an unknown term shows "No matches found" …` |
| `ASP-AUTH-###` | Storefront sign-in & registration | `ASP-AUTH-004 unknown account shows a mismatch error` |
| `ASP-CFG-###` | Product configuration & pricing | `ASP-CFG-007 a size under the minimum shows the minimum-size message` |
| `ASP-CRT-###` | Cart | `ASP-CRT-001 a guest sees an empty cart page` |
| `ASP-UX-###` | Errors & accessibility | `ASP-UX-002 header icons have accessible names` |
| `ASP-MOB-###` | Mobile layout | `ASP-MOB-002 hamburger menu reveals the main navigation` |
| `ASP-ADMA-###` | Admin: access (login, route guard) | `ASP-ADMA-002 LOG IN stays inactive until email and password are both filled` |
| `ASP-ADMO-###` | Admin: order processing (reserved, as in Musticker) | — |

- IDs are never reused. A withdrawn case keeps its ID and is marked withdrawn in TEST-CASES.md with
  the reason.
- Take the next free number in the module.
- A new module gets a new prefix, a folder, and a row in this table.
- Generated cases get their number from their position in a data list (`publicPages`, `redirects`,
  `guardedAdminPaths`). **Add new entries at the end of the list** so existing IDs don't shift.
  `ASP-ADMA-005..` are numbered after the four login-form cases.

## Where a test goes

```
tests/e2e/storefront/<module-folder>/<suite>.spec.ts   customer-facing behaviour
tests/e2e/admin/<module-folder>/<suite>.spec.ts        admin panel behaviour
tests/pom/storefront/<page>.ts                         storefront page objects
tests/pom/admin/<page>.ts                              admin page objects
tests/fixtures/<topic>.ts                              shared helpers and data
```

| Module | Folder |
| --- | --- |
| NAV, RDR, HDR, FTR | `storefront/navigation/` |
| SRCH | `storefront/search/` |
| AUTH | `storefront/auth/` |
| CFG | `storefront/configuration/` |
| CRT | `storefront/cart/` (checkout specs will go in `storefront/checkout/`) |
| UX, MOB | `storefront/ux/` |
| ADMA | `admin/access/` |
| ADMO | `admin/orders/` (when its first spec is written) |

- **One suite per spec file.** The suite name is the top-level `describe` title (`Header navigation`,
  `Die cut configurator`, `Admin login`). A second `describe` in the same file is fine for a closely
  related suite (`Admin route guard`).
- A new case goes into its suite's spec file. A new product configurator gets its own spec
  (`configuration/kiss-cut-configurator.spec.ts`), reusing `ProductConfigPage`.
- CI and scripts select by tag, never by folder.

## Anatomy of a spec

```ts
import { test, expect, gotoStorefront } from '../../../fixtures/asp-test.js';   // never '@playwright/test'
import { Header } from '../../../pom/storefront/header.js';                      // .js even for .ts files
import { search } from '../../../fixtures/storefront-data.js';

test.describe('Header search', { tag: ['@regression', '@production'] }, () => {
  test('ASP-SRCH-001 typing a product name suggests that product', { tag: '@smoke' }, async ({ page }) => {
    // Arrange
    const header = new Header(page);
    await gotoStorefront(page, '/');

    // Act
    await header.search(search.hit.query);

    // Assert
    await expect(header.searchBox.getByRole('link', { name: search.hit.result })).toBeVisible();
  });
});
```

- Arrange / act / assert, separated by blank lines.
- Title: `<ID> <what happens, in plain words>`. Describe the behaviour, not the implementation.
- Each test stands alone: own page, own data, no order dependency (`fullyParallel` is on).
- A test that saves data starts with `refuseProduction()` and then checks its opt-in flag:

```ts
test.describe('Add to cart', { tag: ['@destructive', '@regression'] }, () => {
  test('ASP-CRT-002 a guest adds die cut stickers and skips artwork', async ({ page }) => {
    refuseProduction();
    test.skip(!runCartE2E, 'RUN_CART_E2E is not true');
    // …
  });
});
```

- Admin specs open pages through `AdminLoginPage.goto(path)` (absolute admin URL), never relative
  paths, which resolve against the storefront.

## Tags

Tags go in the `tag` option of the `describe` (and of a single `test` for `@smoke`), never in the
title text.

| Tag | When |
| --- | --- |
| `@smoke` | Fast, high-value; the PR gate. Keep the smoke set under about 2 minutes |
| `@regression` | Every test that belongs in the full run (almost all) |
| `@production` | Only if the test saves nothing. The write guard will fail it otherwise |
| `@auth` | Storefront sign-in and registration |
| `@admin` | Admin panel |
| `@mobile` | Phone-only; runs only in `chromium-mobile` |
| `@destructive` | **Mandatory** when the test saves anything (cart, account, order, inquiry, admin change) |

## Locators and assertions

- **No raw selectors in specs.** Add a locator or method to a page object.
- **Order of preference:** `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` →
  CSS class. The site and the admin panel have no test ids; when a class or id is the only handle,
  comment why in the POM.
- Use `exact: true` for short labels ("100", "Gloss", "Register") that appear elsewhere on the page,
  and scope configurator options to `ProductConfigPage.form`.
- **No site text in page objects or specs.** It goes in `storefront-data.ts` / `admin-data.ts`.
- **Never `page.waitForTimeout()`.** Wait for a locator state, a URL, a response
  (`page.waitForResponse`) or a value (`expect.poll`).
- Use web-first assertions (`await expect(locator).toHaveText(…)`), which retry. Avoid
  `expect(await locator.textContent())` unless you need the value for a later comparison.
- Compare URLs by path: `toHaveURL((url) => url.pathname === '/custom/stickers')`.
- Compare prices relatively (greater than before, equal to the listed price), never to fixed amounts.
  Read prices with `priceValue()` so a sale's struck-through price is ignored.
- Open storefront pages with `gotoStorefront()` (or `ProductConfigPage.open()` for configurators),
  never bare `page.goto()`.

## Data, safety and cleanup

- Production is read-only. If a test needs to save anything it is `@destructive`, refuses
  production and has an opt-in `RUN_*` flag.
- **Never submit the admin login form on production.** Login attempts can lock accounts or send
  verification emails. Signed-in admin tests wait for a dev admin panel and a saved session.
- Use only reserved data: `@example.com` emails, `qa-e2e` prefixes, the dev QA member from `.env`.
- Never put real customer data, passwords, cookies or tokens in code, docs, reports or commits.
- New hosts go only in `environments.ts`.
- When a dev test creates accounts or orders, add cleanup (teardown or an API delete) in the same PR.

## Known defects and preconditions

- A product defect a test checks directly is recorded **as data**: an entry in `knownDefects`
  (`storefront-data.ts`) with a note and, once filed, the Jira key; the test calls
  `test.fail(!!defect, defect.note)`. The run stays green while the defect exists and turns red
  ("expected to fail, but passed") when it's fixed. Then delete the entry in the same PR that confirms
  the fix.
- Noise the page guard would otherwise fail on (a known console error or 4xx) goes in `knownIssues`
  (`known-issues.ts`) with a note and ticket, scoped with `onPage` where possible.
- Never weaken an assertion or catch an error to make a known defect pass.
- A missing precondition (no credentials, no dev server, flag off, no sale running) **skips** with a
  reason; it doesn't fail.
- A read-only POST the write guard blocks goes into `productionWriteAllowlist` with a comment on why
  it's safe. Ask the QA lead if unsure.

## Keeping the case list current

Adding, changing or withdrawing a test also updates [TEST-CASES.md](TEST-CASES.md): ID, suite,
scenario, expected result, environment, tags. Adding or fixing a known defect also updates the
"Known defects" table there. If the team adopts a workbook like Musticker's `docs/test-cases.xlsx`,
it replaces TEST-CASES.md as the single source.

## Pull request checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test:e2e:list` count changed only by what you added or removed
- [ ] New or changed tests pass 5 times: `npx playwright test -g "<ID>" --repeat-each=5 --retries=0`
- [ ] Titles start with a new, unused `ASP-<MODULE>-###` ID
- [ ] Copy in a data file, locators in a page object, no `waitForTimeout`
- [ ] Tags correct; `@production` only on tests that save nothing; `@destructive` gated
- [ ] No admin login submitted on production
- [ ] TEST-CASES.md updated (and its Known defects table, if relevant)
- [ ] No `.env`, `.auth/`, secrets or reports committed
