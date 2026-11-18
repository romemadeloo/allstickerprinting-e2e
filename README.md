# AllStickerPrinting E2E Suite

End-to-end tests for AllStickerPrinting, in Playwright and TypeScript. One suite covers both
applications:

- **Storefront** (`www.allstickerprinting.com`): public pages, header and footer navigation, search,
  sign-in and registration forms, product configuration and pricing, and the cart.
- **Admin panel** (`admin-panel-v2.allstickerprinting.com`): the login form and the guard that keeps
  logged-out visitors out of admin pages.

It follows the team standard set by `musticker-playwright`: the same folder layout, extended `test`
with an error guard, page objects, data files, case IDs and tags.

The test cases (what each test checks and its expected result) are listed in
[docs/TEST-CASES.md](docs/TEST-CASES.md). There is no Excel workbook yet.

| If you want to… | Read |
| --- | --- |
| Run the tests | [docs/RUNNING.md](docs/RUNNING.md): setup, commands, environments, variables, CI |
| See what is covered | [docs/TEST-CASES.md](docs/TEST-CASES.md): every case ID, steps and expected result |
| Understand how the suite is built | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): fixtures, page objects, safety guards, site quirks |
| Write or change a test | [docs/CONVENTIONS.md](docs/CONVENTIONS.md): IDs, tags, locators, data rules, review checklist |

## 1. Before you start

You need:

- **Node.js 22** (or newer) and **Git**.
- **VS Code** (recommended), with the Playwright Test extension.
- **Access to the GitHub repository** for this suite. Ask the QA lead for the URL and access.
- **Your test server**, assigned by the QA lead (see [Servers](#3-servers)). Until an
  AllStickerPrinting dev server is set up, only the read-only production tests can run.

## 2. Set up your machine

Run these in a terminal (PowerShell on Windows). Replace `<repository-url>` with the GitHub URL.

```bash
git clone <repository-url> allstickerprinting-e2e
cd allstickerprinting-e2e
npm install
npx playwright install chromium
cp .env.example .env               # PowerShell: Copy-Item .env.example .env
```

Open `.env` and set at least:

| Variable | What it does |
| --- | --- |
| `E2E_ENVIRONMENT` | Which servers to test: `production` (default, read-only tests only) or `dev` |
| `ASP_DEV_BASE_URL` / `ASP_DEV_API_URL` / `ASP_DEV_ADMIN_URL` | The dev storefront, API and admin URLs. Required when `E2E_ENVIRONMENT=dev` |
| `ASP_MEMBER_EMAIL` / `ASP_MEMBER_PASSWORD` | A test member on the dev server. Empty = the member sign-in test is skipped |
| `HEADED` | `true` shows the browser while tests run |

Every variable is explained in `.env.example` and in [docs/RUNNING.md](docs/RUNNING.md#environment-variables).
Ask the QA lead for secret values. `.env` is never committed.

Check the install:

```bash
npm run typecheck          # compiles the TypeScript, no browser
npm run test:e2e:list      # lists every test without opening a browser
```

If the second command ends with `Total: 69 tests in 12 files`, you're ready. If it errors, the
install or `.env` is wrong.

## 3. Servers

| `E2E_ENVIRONMENT` | Server | Storefront | Admin panel | What runs |
| --- | --- | --- | --- | --- |
| `production` | Production | `www.allstickerprinting.com` | `admin-panel-v2.allstickerprinting.com` | Read-only tests only. A guard blocks every save-type call |
| `dev` | The dev server the QA lead assigns | `ASP_DEV_BASE_URL` | `ASP_DEV_ADMIN_URL` | Everything, including `@destructive` tests when their flag is on |

- Team rule **DEC-007**: test on dev servers; production is for read-only checks.
- **No AllStickerPrinting dev server is registered yet.** When the QA lead provides one, put its
  URLs in `.env`.
- All server URLs are in `tests/fixtures/environments.ts`, the only file that names hosts.

## 4. Run tests

| What | Command |
| --- | --- |
| UI mode: pick tests, watch them, step through (best for learning and debugging) | `npm run test:e2e:ui` |
| One test by case ID | `npx playwright test -g "ASP-CFG-004"` |
| One spec file | `npx playwright test tests/e2e/storefront/auth/sign-in.spec.ts` |
| With the browser visible | `npm run test:e2e:headed` |
| Smoke tests | `npm run test:smoke` |
| Regression tests | `npm run test:regression` |
| Storefront only / admin only | `npm run test:storefront` / `npm run test:admin` |
| Production smoke (read-only) | `npm run test:prod:smoke` |
| Everything safe on production | `npm run test:prod:full` |
| Mobile tests (Pixel 7) | `npm run test:mobile` |
| Tests that save data (dev server only) | `npm run test:destructive` |

**Your first run:** start `npm run test:e2e:ui`, type `ASP-NAV-001` in the filter box, and press ▶.
It only opens the homepage, so it is safe on any server. Green tick = passed; red cross = failed,
click it to see the error and a screenshot.

**When a test fails**, open the report:

```bash
npx playwright show-report
```

It shows the failing step, a screenshot, a video, and a trace you can replay step by step.

Tests run against whatever `E2E_ENVIRONMENT` says in `.env`. To change one setting for one command
without editing `.env`, e.g. in PowerShell:
`$env:E2E_BROWSER_PROJECT="firefox-desktop"; npx playwright test -g "ASP-NAV-001"`.

## 5. How the suite is built

```
spec (tests/e2e/…)              the test: steps and checks, named by case ID
  → fixtures (asp-test.ts)      ready-made setup: browser tab, error guard, production write guard
  → page objects (tests/pom)    ready-made actions for one page: openSignIn(), choose(), setSize()
  → data (*-data.ts)            page paths, button text, expected copy, known defects
```

- **Page objects (POM)**: one class per page part or dialog (`Header`, `AuthModal`,
  `ProductConfigPage`, `AdminLoginPage`). Tests call its methods instead of finding buttons
  themselves, so when the site changes you fix one place.
- **Fixtures**: every spec imports `test` from `tests/fixtures/asp-test.ts`, not from Playwright
  directly. That gives you:
  - `page`: a browser tab with an **error guard**. A test fails on any console error or HTTP error
    from AllStickerPrinting, even if its checks pass. Expected errors are allowed by name, e.g.
    `test.use({ allowNotFoundPaths: ['/missing-page'] })`.
  - A **production write guard**: on production, any save-type API call (POST/PUT/PATCH/DELETE)
    that is not on the read-only allowlist is blocked and fails the test.
  - `gotoStorefront(page, path)`: opens a storefront page and waits until it's ready to click.
  - `refuseProduction()`: skips a test on production.

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Layout

```
tests/
  e2e/
    storefront/            customer-facing specs, one folder per module
      navigation/          public pages, redirects, header, footer   (NAV, RDR, HDR, FTR)
      search/              header search                             (SRCH)
      auth/                sign-in and register forms                (AUTH)
      configuration/       product configurator and pricing          (CFG)
      cart/                cart page and add to cart                 (CRT)
      ux/                  error pages, accessibility, mobile        (UX, MOB)
    admin/
      access/              admin login form and route guard          (ADMA)
  pom/
    storefront/            header, auth modal, product configurator
    admin/                 admin login page
  fixtures/                the extended `test`, environments, storefront and admin data, known issues
docs/                      documentation and the test case list
.github/workflows/         GitHub Actions: PR smoke run and manual runs
playwright.config.ts       Playwright settings
.env.example               template for your .env
```

The folders mirror the case list: **module** = folder, **suite** = spec file and its top-level
`describe` title, **case ID + title** = test title.

## 6. Write a test

A real test, from `tests/e2e/storefront/configuration/die-cut-configurator.spec.ts`:

```ts
import { test, expect } from '../../../fixtures/asp-test.js';
import { ProductConfigPage } from '../../../pom/storefront/product-config-page.js';
import { dieCut } from '../../../fixtures/storefront-data.js';

test.describe('Die cut configurator', { tag: ['@regression', '@production'] }, () => {
  let product: ProductConfigPage;

  test.beforeEach(async ({ page }) => {
    product = new ProductConfigPage(page);
    await product.open();
  });

  test('ASP-CFG-003 a larger quantity updates the summary and raises the price', async () => {
    const basePrice = await product.priceValue();

    await product.choose(dieCut.quantities.next);

    await expect(product.summary).toContainText(`Qty : ${dieCut.quantities.next}`);
    await expect.poll(() => product.priceValue()).toBeGreaterThan(basePrice);
  });
});
```

The easiest way to start is to copy a test next to where yours belongs. The rules that matter:

- The test title starts with its **case ID** (`ASP-<MODULE>-###`). IDs are never reused.
- Tags go on the `describe` in the `tag` option. Add `@destructive` when the test saves anything,
  and `@production` only if the test is safe there.
- No raw selectors in specs: use page object methods. No site text inside page objects or specs:
  put it in `storefront-data.ts` / `admin-data.ts`. Never use `page.waitForTimeout()`.
- Open storefront pages with `gotoStorefront()`, not `page.goto()`.
- Imports end in `.js` even though the files are `.ts`.
- Add or update the case in [docs/TEST-CASES.md](docs/TEST-CASES.md).

Full rules: [docs/CONVENTIONS.md](docs/CONVENTIONS.md).

## 7. Save your work and get it into `main`

### Commit and push to GitHub

```bash
git checkout main
git pull                                  # start up to date
git checkout -b asp-crt-003-cart-remove   # your own branch for this work
# … write and run your test …
npm run typecheck
git status                                # see what changed
git add tests/ docs/
git commit -m "ASP-CRT-003 removing the only item empties the cart"
git push -u origin asp-crt-003-cart-remove
```

Run your test, and `npm run typecheck`, before pushing. Start commit messages with the case ID.
Never commit `.env`, `.auth/`, `test-results/` or `playwright-report/`.
Prefer clicking? Use VS Code's Source Control panel: stage, write a message, Commit, Sync.

### Getting your work into `main`

1. **Finish on your branch**: tests pass 5 times in a row
   (`npx playwright test -g "ASP-CRT-003" --repeat-each=5 --retries=0`), typecheck passes,
   everything pushed.
2. **Open a pull request** on GitHub into `main`. The PR runs the `@smoke` suite on production
   automatically.
3. **Notify the QA lead** with the branch, the case IDs, and the server they passed on. For example:
   *"asp-crt-003-cart-remove is ready. Cases: ASP-CRT-003. Passed on: dev. Typecheck: pass."*
4. **Wait for the QA lead's OK.** Never merge into `main` without it.
5. Merge the pull request on GitHub, then delete the branch.

## 8. Safety

Every test is safe on production unless it is tagged `@destructive`. Those tests:

- refuse to run against production, whatever flags are set;
- are off by default, each gated by its own variable (`RUN_CART_E2E`);
- are never run by CI.

On top of that, the **production write guard** blocks any save-type API call on production that is
not on the read-only allowlist in `tests/fixtures/known-issues.ts`, so even a mistake in a test
cannot create carts, accounts or orders on the live site.

The **admin tests never submit the login form** with credentials: they check the form, its
validation and the route guard only. No login attempt or verification email reaches production.

> **Watch out:** on this site, clicking **Add to Cart** saves the cart item immediately
> (`POST /api/cart-items/create`), *before* the artwork upload box opens. Never click it in a test
> that can run on production.

Use only reserved test data: `@example.com` addresses and a `qa-e2e` prefix for anything you create.
Keep `RUN_CART_E2E=false` unless you mean to create carts on your dev server.

## 9. Stuck?

| Problem | Try |
| --- | --- |
| `git clone` or `git push` is refused | Ask the QA lead for access to the GitHub repository; sign in with `gh auth login` or Git Credential Manager |
| `npm run test:e2e:list` errors | Re-run `npm install`; check `.env` exists and `E2E_ENVIRONMENT` is `production` or `dev` |
| `E2E_ENVIRONMENT=dev needs ASP_DEV_…` | Fill in all three dev URLs in `.env` |
| Browser won't start (`Executable doesn't exist`) | `npx playwright install chromium` |
| Member sign-in test is skipped | It always skips on production; on dev, set `ASP_MEMBER_EMAIL` / `ASP_MEMBER_PASSWORD` |
| Add-to-cart test is skipped | It always skips on production; on dev, set `RUN_CART_E2E=true` |
| A test shows as "expected to fail" | It checks a known defect (`test.fail`). See [CONVENTIONS.md](docs/CONVENTIONS.md#known-defects-and-preconditions) |
| `This spec tried to write to production` | The write guard blocked a save-type call. See [ARCHITECTURE.md](docs/ARCHITECTURE.md#production-write-guard) |
| Test passes its checks but still fails | The error guard caught a console or HTTP error: see the report |
| A click does nothing, then a timeout | The page wasn't ready: open it with `gotoStorefront()` / `ProductConfigPage.open()` |
| Pages return 403 during big runs | The site firewall is rate-limiting you. Set `PW_WORKERS=1` |

More: [docs/RUNNING.md](docs/RUNNING.md#troubleshooting).

## Numbers

71 tests: 69 desktop (61 storefront, 8 admin) and 2 mobile (`@mobile` runs only in the
`chromium-mobile` project). Two of them check known defects and are expected to fail until the
defects are fixed (ASP-CFG-010, ASP-UX-002). Use `npm run test:e2e:list` to see the current inventory.

## Owner

The QA team. Report suite problems to the QA lead, and product defects through Jira.
#   a l l s t i c k e r p r i n t i n g - e 2 e  
 