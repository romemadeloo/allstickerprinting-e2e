# How the suite is built

- [The big picture](#the-big-picture)
- [Configuration](#configuration)
- [The extended test](#the-extended-test)
- [Production write guard](#production-write-guard)
- [Environments and URLs](#environments-and-urls)
- [Page objects](#page-objects)
- [Storefront and admin](#storefront-and-admin)
- [Resilience: hydration, pricing load, copy drift](#resilience-hydration-pricing-load-copy-drift)
- [Test data and cleanup](#test-data-and-cleanup)
- [Known defects in code](#known-defects-in-code)
- [Site notes](#site-notes)
- [Fixture reference](#fixture-reference)

## The big picture

```
spec (tests/e2e/storefront|admin/<module>/<suite>.spec.ts)
  → imports { test, expect, gotoStorefront, refuseProduction } from fixtures/asp-test.ts
  → drives page objects (tests/pom/storefront|admin/*.ts)
  → which read copy and data from fixtures/storefront-data.ts / admin-data.ts
```

- **Specs** describe behaviour: steps and assertions, titled with a case ID.
- **Page objects** own every locator and multi-step action.
- **Data** owns every string the tests depend on: paths, headings, labels, error messages, and the
  list of known product defects.
- **Fixtures** add guards that run around every test automatically.

The suite follows the `musticker-playwright` design. It shares its storefront framework with the
`ozstickerprinting-playwright` suite (same Glophics platform), adapted for US sizes (inches), the
quantity widget, sale prices and the admin panel. Not ported yet: seeded member sessions, admin
sessions, self-heal and dashboard reporters.

## Configuration

`playwright.config.ts`:

| Setting | Value | Why |
| --- | --- | --- |
| `testDir` | `./tests/e2e` | Specs only; POM and fixtures live beside it |
| `timeout` / `expect.timeout` | 60 s / 10 s | Pages wait for network idle; 60 s leaves room |
| `fullyParallel` | `true` | Same isolation locally and in CI |
| `retries` | 1 local, 2 CI | A retry records a trace |
| `workers` | `PW_WORKERS`, default 2 | The production firewall rate-limits per IP |
| `use.baseURL` | `env.baseUrl` (storefront) | Storefront specs use relative paths; admin specs use `adminUrl()` |
| `use.locale` / `timezoneId` | `en-US` / `America/New_York` | Matches the site's market |
| `trace` / `screenshot` / `video` | on first retry / only on failure / retain on failure | Evidence without bloat |
| `projects` | from `E2E_BROWSER_PROJECT` | One project per run by default |
| `metadata` | environment name and base URL | Shown in the HTML report |

`tests/fixtures/env.ts` loads `.env` (via `dotenv`) and resolves the environment at import time,
so a bad `E2E_ENVIRONMENT` fails before any browser starts.

## The extended test

`tests/fixtures/asp-test.ts` extends Playwright's `test` with an automatic `pageGuard` fixture.
Every spec gets it without asking for it.

During the test it records:

| Recorded | Ignored |
| --- | --- |
| `console.error` messages | `Failed to load resource…` (the response check reports those, with the URL) |
| Uncaught page errors (`pageerror`) | Anything matching an entry in `knownIssues` |
| Responses with status ≥ 400 from `www.`, `api.`, `admin-panel-v2.` or `static.allstickerprinting.com` (or the dev hosts) | Third-party hosts (analytics, chat widget, social) |
| | A 404 on a path listed in `allowNotFoundPaths` |

After the test body finishes it removes the request routes, then asserts that both the
blocked-writes list and the problems list are empty. **A test whose own checks all pass still fails
if the page logged an error or a site request failed.** That's deliberate: it catches broken pages
that a narrow assertion would miss.

Options (set with `test.use()`):

| Option | Type | Default | Use |
| --- | --- | --- | --- |
| `allowNotFoundPaths` | `string[]` | `[]` | Paths whose 404 is the point of the test (`ASP-UX-001`) |

## Production write guard

When `env.isProduction` is true, the guard routes every request to the API host (used by both the
storefront and the admin panel):

- `GET`, `HEAD`, `OPTIONS` → continue.
- `POST`, `PUT`, `PATCH`, `DELETE` → continue **only if** the path matches
  `productionWriteAllowlist` in `tests/fixtures/known-issues.ts`; otherwise **abort** the request,
  add a `blocked-production-write` annotation, and fail the test with
  `This spec tried to write to production; mark it @destructive and gate it`.

The allowlist holds calls that use POST but save nothing:

| Path | Why it's safe |
| --- | --- |
| `/api/security/soft-login` | Storefront sign-in attempt. With an `@example.com` address it returns `{status:"FAIL"}` |
| `/api/user/signin` | Called right after a failed soft-login; only returns an error |
| `/api/site/seo` | Page metadata lookup during in-site navigation |
| `/api/site/redirect` | Redirect lookup before the 404 page is shown |
| `/api/admin/signout` | The logged-out admin panel ends a session that doesn't exist (401) |

Adding to the allowlist needs evidence that the call writes nothing (response body, network tab, or
developer confirmation) and a comment saying so. Never add `cart-items`, `order`, `user/register`,
`admin/signin` or similar.

`page.unrouteAll({ behavior: 'ignoreErrors' })` runs before the page closes. Without it, closing
waits for in-flight routed requests and each test spends about a minute in teardown.

## Environments and URLs

- `tests/fixtures/environments.ts` is the only file that names hosts. `resolveEnvironment(name)`
  returns `{ name, baseUrl, apiBaseUrl, adminPanel, isProduction }`.
- `dev` reads `ASP_DEV_BASE_URL`, `ASP_DEV_API_URL` and `ASP_DEV_ADMIN_URL`, strips trailing
  slashes, and throws if any is missing or points at a production host.
- `env.ts` exports `env`, `ownHosts` (hosts the error guard watches), `isOwnHost(url)`,
  `adminUrl(path)`, `memberCredentials` (or `undefined`) and `runCartE2E`.

## Page objects

Constructor takes `page`; locators are `readonly` fields; actions are `async` methods. Copy comes
from the data files.

### `Header` (`tests/pom/storefront/header.ts`)

| Member | What it is |
| --- | --- |
| `root`, `nav`, `logo` | `<header>`, the main menu `<nav>`, the logo link (`a.logo_holder`) |
| `navLink(name)` | A main menu link by exact text (Stickers, Business Card, …) |
| `accountIcon`, `openSignIn()`, `openRegister()` | Account icon and the two buttons in its menu |
| `cartIcon`, `cartCount`, `cartDropdown` | Cart icon (`#view_cart_item`, it has no accessible name), its badge, the mini-cart |
| `searchIcon`, `searchInput`, `searchBox`, `search(query)` | Header search: open, type, results panel |
| `mobileMenuToggle` | The visible hamburger label (phones) |

### `AuthModal` (`tests/pom/storefront/auth-modal.ts`)

| Member | What it is |
| --- | --- |
| `root` | `.g-modal`, the sign-in / register dialog |
| `heading` | Sign-in title (`.g-modal-header h3`) |
| `title(text)` | Any title by text (register's title is in the body) |
| `tab(name)` | Member / Non-member tabs |
| `field(label)`, `input(label)` | A `.g-input` wrapper found by its label text, and its `<input>` |
| `button(name)` | A button by exact name |
| `signIn(email, password)` | Fill both fields and press Sign In |
| `formError`, `closeButton` | Form-level error (`.error_msg`) and the × button |

### `ProductConfigPage` (`tests/pom/storefront/product-config-page.ts`)

| Member | What it is |
| --- | --- |
| `open(path)` | Opens a product page, waits for `/api/get/pricing-data`, the size inputs and a non-zero price |
| `form` | `form.quote_form`, the configurator panel (options are scoped to it) |
| `option(label)`, `choose(label)` | An option chip; `choose` clicks it and waits for the summary to change |
| `widthInput`, `heightInput`, `setSize(w, h?)` | Size in inches (placeholders `width (in)` / `height (in)`) |
| `summary` | Order summary line, e.g. `Die Cut / Square / 1.2x1.2in / Gloss / Normal / Qty : 100` |
| `priceHolder`, `originalPrice`, `priceValue()` | Price area; the struck-through price during a sale; the number the customer pays |
| `seeMore`, `moreQuantities`, `moreQuantity(qty)`, `listedPrice(qty)` | "See More" dropdown, its rows (`li[data-value]`), one row, and the price that row lists |
| `quantityRule`, `message(text)` | "divisible by…" note; any exact message (size errors) |
| `addToCartButton`, `artworkModal` | Add to Cart and the Upload Artwork dialog. **Add to Cart saves data** |

### `AdminLoginPage` (`tests/pom/admin/admin-login-page.ts`)

| Member | What it is |
| --- | --- |
| `goto(path)` | Opens an admin path (absolute URL via `adminUrl`) and waits for the login form |
| `logo`, `emailInput`, `passwordInput`, `rememberMe`, `submitButton` | The form's parts (inputs found by placeholder) |
| `showPassword` | The eye icon (`a.show_password`) |
| `submitWrapper`, `isSubmitActive()` | The `div.buttons.login` wrapper and whether LOG IN accepts clicks |
| `message(text)` | Any exact message, e.g. "Invalid Email Address." |

## Storefront and admin

- Both apps call the same API host (`api.allstickerprinting.com`), so the write guard covers both.
- The admin panel is a separate origin. Specs open it with `adminUrl(path)` instead of a relative
  path, and don't use `gotoStorefront()`.
- Admin coverage is logged-out only. A signed-in admin fixture (`adminPage`, saved session) and
  storefront-to-admin order journeys, like Musticker's `admin-test.ts` and `order-lifecycle.ts`,
  need a dev admin panel and a QA admin account first.

## Resilience: hydration, pricing load, copy drift

- **Hydration.** The storefront and admin panel are Nuxt 2 apps. `window.$nuxt` appears before
  click handlers and async data are ready, so early clicks are silently ignored. `gotoStorefront()`
  waits for `load`, then `$nuxt`, then network idle (bounded at 15 s because third-party widgets can
  keep the network busy). `AdminLoginPage.goto()` does the same for the admin panel.
- **Pricing load.** Until `/api/get/pricing-data` answers, the configurator shows placeholder
  values (`Qty : 10`, `$0.00`). `ProductConfigPage.open()` waits for that response and for a
  non-zero price before any test reads the panel.
- **Waiting on change, not time.** `choose()` waits until the old summary text is gone. Price checks
  use `expect.poll`. There is no `waitForTimeout` anywhere.
- **Sale prices.** During a promotion the price area shows `<em class="strikethrough">$34.00</em> $28.00`.
  `priceValue()` reads the price paid, ignoring the struck-through one. Tests compare prices with each
  other or with a listed price, never with fixed amounts.
- **Copy drift.** All copy lives in the data files, so a wording change is a one-line fix. Titles use
  regexes on the stable part (`/Custom Die Cut Stickers/`), not the whole SEO title.
- **Firewall.** Keep `PW_WORKERS` low on production. There's no WAF retry helper yet; Musticker's
  `navigation.ts` is the model if one is needed.

## Test data and cleanup

- Production: nothing is created; the write guard ensures it. Admin specs type sample values into the
  login form but never submit them.
- Reserved data only: `qa-e2e-nobody@example.com` for negative sign-in; `@example.com` addresses and
  a `qa-e2e` prefix for anything a dev test creates.
- `ASP-CRT-002` uses a fresh browser context, so its guest cart belongs to that context only. There
  is no teardown that deletes carts or accounts yet; add one (Musticker's `global-teardown.ts` +
  ledger is the model) before writing tests that register accounts.

## Known defects in code

Two mechanisms, both data with a note, never a loosened assertion:

**1. Defects a test checks directly** are listed in `knownDefects` in `storefront-data.ts` (or marked
inline for one-off cases). The test calls `test.fail(condition, note)`: while the defect exists the
test fails as expected and the run stays green; when the defect is fixed the test passes, Playwright
reports "expected to fail, but passed", and the run turns red. Then delete the entry.

| Case | Defect |
| --- | --- |
| `ASP-CFG-010` | Sticker configurators say "We only accept those that are divisible by **0**. For example 10, 20, 30" |
| `ASP-UX-002` | The header cart link (`#view_cart_item`) has no accessible name (no `aria-label`, no text) |

**2. Noise the page guard should tolerate** is listed in `knownIssues` in `known-issues.ts`:

```ts
{
  match: /^401 .*\/api\/admin\/signout$/,   // console text or "<status> <url>"
  onPage: /admin-panel/,                    // optional: only on these pages
  note: 'Logged-out admin panel calls admin/signout and gets 401. Not yet reported.',
  ticket: undefined                         // add the Jira key once filed
}
```

Rules: one entry per defect, with a note and (once filed) a ticket; as narrow as possible; removed
when the fix ships so a regression fails again.

## Site notes

- No `data-testid` attributes. The CSS hooks used (`.g-modal`, `.g-input`, `.error_msg`,
  `#view_cart_item`, `.cart_number`, `.cart_dropdown`, `.search_box`, `nav.nav_menu`,
  `a.logo_holder`, `label.for_menu--`, `form.quote_form`, `.price_holder`, `em.strikethrough`,
  `ul.drop_values`, `.up_artwork_modal`, `form.login`, `div.buttons.login`, `a.show_password`) are all
  inside page objects.
- Modal labels have no `for` attribute, so `getByLabel()` doesn't work there.
- `/stickers` redirects to `/custom/stickers` (the main menu's Stickers link).
- Sizes are in **inches**. Die cut minimum is 1.2 × 1.2 in; very large sizes switch to a
  special-size quote and hide Add to Cart.
- The page has a second width/height pair (the special-size quote form, placeholders `width` /
  `height`); the configurator's are `width (in)` / `height (in)`.
- A failed sign-in calls `security/soft-login`, then `user/signin`, and shows
  "Your email address and password do not match."
- **Add to Cart** sends `POST /api/cart-items/create` immediately, before the artwork dialog.
- Admin login: inputs found by placeholder; LOG IN ignores clicks until both fields are filled (its
  wrapper gets a `disabled` class and the button `pointer-events: none`, but the button itself has no
  `disabled` attribute, so assistive tech announces it as enabled).
- Search suggestions have two sections, Products and Uses; each shows "No matches found." when empty.

## Fixture reference

| Export | From | Purpose |
| --- | --- | --- |
| `test`, `expect` | `asp-test.ts` | Extended test with `pageGuard`; use instead of `@playwright/test` |
| `gotoStorefront(page, path)` | `asp-test.ts` | Navigate the storefront and wait for readiness; returns the response |
| `refuseProduction(reason?)` | `asp-test.ts` | `test.skip` on production |
| `GuardOptions` | `asp-test.ts` | `allowNotFoundPaths` |
| `env`, `ownHosts`, `isOwnHost`, `adminUrl` | `env.ts` | Active environment, watched hosts, admin URLs |
| `memberCredentials`, `runCartE2E` | `env.ts` | Opt-in data and flags |
| `resolveEnvironment` | `environments.ts` | Environment table |
| `knownIssues`, `productionWriteAllowlist` | `known-issues.ts` | Guard exceptions |
| `nav`, `publicPages`, `redirects`, `footerLinks`, `contactEmail`, `auth`, `search`, `cart`, `dieCut`, `notFound`, `knownDefects` | `storefront-data.ts` | Storefront copy and test data |
| `adminLogin`, `guardedAdminPaths` | `admin-data.ts` | Admin copy and test data |
