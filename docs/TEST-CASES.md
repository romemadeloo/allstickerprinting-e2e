# Test cases

Every automated case, grouped by app and module. **Env**: `P` = runs on production (read-only);
`Dev` = refuses production and runs only on a dev server, with the precondition shown.

Totals: 71 cases: 69 desktop (61 storefront, 8 admin) and 2 mobile.

## Known defects

Cases that check a defect present on production. They are marked `test.fail()`, so they pass while
the defect exists and fail the run once it's fixed (then remove the marker).

| Case | Defect | Seen | Jira |
| --- | --- | --- | --- |
| ASP-CFG-010 | Sticker configurators say "We only accept those that are divisible by **0**. For example 10, 20, 30, and so on." | 2026-11-18, die-cut, kiss-cut, transparent | Not filed |
| ASP-UX-002 | Header cart link `#view_cart_item` has no accessible name (OzStickerPrinting's has `aria-label="View Cart"`) | 2026-11-18, all pages | Not filed |

Other observations (not failing any test):

- Admin login: LOG IN is blocked with CSS (`pointer-events: none` on a `disabled` wrapper), but the
  button has no `disabled` attribute, so screen readers announce it as available.
- Admin panel: a logged-out visit calls `POST /api/admin/signout`, which returns 401 (allowed as a
  known issue in `known-issues.ts`).

---

# Storefront

## NAV: Public pages

Spec `tests/e2e/storefront/navigation/public-pages.spec.ts`, suite **Public pages**, tags
`@smoke @regression @production`. Steps for each: open the path → check HTTP 200, the page title
and the first H1.

| ID | Path | Expected H1 | Title contains | Env |
| --- | --- | --- | --- | --- |
| ASP-NAV-001 | `/` | Custom Stickers | Custom Sticker Printing | P |
| ASP-NAV-002 | `/custom/stickers` | Stickers | Shop Stickers for Any Need | P |
| ASP-NAV-003 | `/stickers/die-cut` | Die Cut Stickers | Custom Die Cut Stickers | P |
| ASP-NAV-004 | `/stickers/kiss-cut` | Kiss Cut Stickers | Custom Kiss Cut Stickers | P |
| ASP-NAV-005 | `/stickers/sheet` | Sticker Sheets | Custom Sticker Sheets | P |
| ASP-NAV-006 | `/stickers/roll` | Roll Stickers | Custom Roll Stickers | P |
| ASP-NAV-007 | `/stickers/paper/art` | Art Paper Stickers | Art Paper Stickers | P |
| ASP-NAV-008 | `/stickers/vinyl/transparent` | Transparent Stickers | Custom Clear Stickers | P |
| ASP-NAV-009 | `/stickers/special/hologram` | Hologram Stickers | Custom Holographic Stickers | P |
| ASP-NAV-010 | `/business-cards` | Business Cards | Custom Business Cards | P |
| ASP-NAV-011 | `/business-cards/standard-business-card` | Standard Business Cards | Standard Business Cards | P |
| ASP-NAV-012 | `/buttons-and-magnets` | Buttons & Magnets | Buttons & Magnets | P |
| ASP-NAV-013 | `/buttons/pin-button` | Pin Buttons | Custom Pin Buttons | P |
| ASP-NAV-014 | `/magnets/custom-magnet` | Custom Magnets | Custom Printed Magnets | P |
| ASP-NAV-015 | `/hang-tags` | Hang Tags | Custom Hang Tags | P |
| ASP-NAV-016 | `/sample-pack` | Sticker Sample Pack | Sticker Samples | P |
| ASP-NAV-017 | `/vinyl-lettering-designer` | Vinyl Lettering Designer | Custom Vinyl Lettering | P |
| ASP-NAV-018 | `/about` | Who We Are | About AllStickerPrinting | P |
| ASP-NAV-019 | `/user-guide/faq` | FAQ | Frequently Asked Questions | P |
| ASP-NAV-020 | `/user-guide/artwork-guide` | Artwork Guide | Artwork Guide | P |
| ASP-NAV-021 | `/success-stories` | Success Stories | Success Stories | P |
| ASP-NAV-022 | `/blog` | Blogs | Blogs | P |
| ASP-NAV-023 | `/sitemap` | Site Map | Sitemap | P |
| ASP-NAV-024 | `/terms-and-condition` | Terms and Conditions | Terms & Conditions | P |
| ASP-NAV-025 | `/privacy-policy` | Privacy Policy | Privacy Policy | P |

## RDR: Redirects

Spec `tests/e2e/storefront/navigation/redirects.spec.ts`, suite **Redirects**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-RDR-001 | Open `/stickers` | Lands on `/custom/stickers` with HTTP 200 | P |

## HDR: Header navigation

Spec `tests/e2e/storefront/navigation/header.spec.ts`, suite **Header navigation**, tags `@smoke @regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-HDR-001 | Home → click **Stickers** | URL `/custom/stickers`; H1 "Stickers" | P |
| ASP-HDR-002 | Home → click **Business Card** | URL `/business-cards`; H1 "Business Cards" | P |
| ASP-HDR-003 | Home → click **Buttons & Magnets** | URL `/buttons-and-magnets`; H1 "Buttons & Magnets" | P |
| ASP-HDR-004 | Home → click **Get Samples** | URL `/sample-pack`; H1 "Sticker Sample Pack" | P |
| ASP-HDR-005 | Open `/about` → click the logo | URL `/` | P |
| ASP-HDR-006 | Home as guest → check cart badge → click cart icon | Badge "0"; dropdown visible with "There are no items in the cart." | P |

## FTR: Footer

Spec `tests/e2e/storefront/navigation/footer.spec.ts`, suite **Footer**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-FTR-001 | Home → for Die Cut Stickers, Standard Business Card, Hang Tags, Pin Buttons, About Us, FAQ, Artwork Guide, Terms of Service, Privacy Policy: read `href`, request it | Each `href` is the expected path and returns 200 | P |
| ASP-FTR-002 | Home → find the contact email link | `href` is `mailto:info@allstickerprinting.com` | P |
| ASP-FTR-003 | Home → click footer **FAQ** | URL `/user-guide/faq`; H1 "FAQ" | P |

## SRCH: Search

Spec `tests/e2e/storefront/search/header-search.spec.ts`, suite **Header search**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-SRCH-001 `@smoke` | Home → search icon → type "hologram" | Products section shows a "Hologram Stickers" link | P |
| ASP-SRCH-002 | Same → click the suggestion | URL `/stickers/special/hologram`; H1 contains "Hologram" | P |
| ASP-SRCH-003 | Home → search icon → type "zzqqxx-no-such-product" | "No matches found." twice (Products, Uses); no result links | P |

## AUTH: Sign-in & registration

Specs `tests/e2e/storefront/auth/sign-in.spec.ts` (suites **Sign in modal**, **Register modal**, tags
`@auth @regression @production`) and `tests/e2e/storefront/auth/member-sign-in.spec.ts` (suite
**Member sign in**, tags `@auth @regression`).

Common start for 001–007: Home → account icon → **Sign in to Account** → modal "Sign In to your account".

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-AUTH-001 `@smoke` | Look at the modal | Member tab selected; Email Address and Password (masked) fields; Sign In, Login with Facebook, Login with Google buttons | P |
| ASP-AUTH-002 | Click **Sign In** with both fields empty | "Email address is required. Please try again." and "Password is required. Please try again." | P |
| ASP-AUTH-003 | Email `not-an-email` → **Sign In** | "Please enter a valid email." | P |
| ASP-AUTH-004 | Email `qa-e2e-nobody@example.com`, password `WrongPass123!` → **Sign In** | `soft-login` returns `status: FAIL`; "Your email address and password do not match."; modal stays open | P |
| ASP-AUTH-005 | Type a password → click the eye icon | Password input type becomes `text` | P |
| ASP-AUTH-006 | Click **Non-member** | Email Address, Order Number, "Check Your Order"; no password field | P |
| ASP-AUTH-007 | Click × | Modal closes | P |
| ASP-AUTH-008 | Account icon → **Register** → submit empty | "New Member Registration"; required errors for First Name, Last Name, Email Address, Password | P |
| ASP-AUTH-009 | Sign in with the `.env` QA member | Modal closes; account menu no longer offers "Sign in to Account" | Dev + `ASP_MEMBER_EMAIL`/`PASSWORD` |

## CFG: Product configuration & pricing

Spec `tests/e2e/storefront/configuration/die-cut-configurator.spec.ts`, suite **Die cut configurator**,
tags `@regression @production`. Start for each: open `/stickers/die-cut` and wait for the pricing
response. These tests never click Add to Cart.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-CFG-001 `@smoke` | Look at the defaults | H1 "Die Cut Stickers"; summary "Die Cut / Square / 1.2x1.2in / Gloss / Normal / Qty : 100"; width and height 1.2; price > $0; Add to Cart enabled | P |
| ASP-CFG-002 | Choose finish **Matte** | Summary contains "/ Matte /" | P |
| ASP-CFG-003 | Note price → choose quantity **200** | Summary "Qty : 200"; price higher than before | P |
| ASP-CFG-004 | Click **See More** → pick **1000** | List has 300, 400, 500, 1000, 5000, 10000, "Custom Qty" last; summary "Qty : 1000"; price paid equals the price shown in the 1000 row | P |
| ASP-CFG-005 | Look at the price during a sale | Price paid is lower than the struck-through original. Skips when no sale is running | P |
| ASP-CFG-006 | Width 2 → Tab | Summary contains "Rectangle / 2x1.2in" | P |
| ASP-CFG-007 | Width 0.2 → Tab | "* Width or height must not be below 1.2x1.2in for Die Cut." | P |
| ASP-CFG-008 | Width 30 → Tab | "* For special sizes, request a quote from the button below."; Add to Cart hidden | P |
| ASP-CFG-009 | Choose material **Kraft Paper** | Summary still starts "Die Cut /"; price > $0; Add to Cart enabled | P |
| ASP-CFG-010 | Read the quantity rule note | Names a real divisor ("divisible by N", N ≥ 1). **Known defect: says "divisible by 0"** (`test.fail`) | P |

## CRT: Cart

Spec `tests/e2e/storefront/cart/cart.spec.ts`, suites **Cart page** (`@regression @production`) and
**Add to cart** (`@destructive @regression`).

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-CRT-001 | Open `/cart` as guest | H1 "Cart (0)" | P |
| ASP-CRT-002 | Open die cut page → **Add to Cart** → "Skip & upload artwork later" → open `/cart` | Upload Artwork dialog appears; cart badge "1"; cart H1 "Cart (n)"; the configured item is listed | Dev + `RUN_CART_E2E=true` |

## UX: Errors & accessibility

Specs `tests/e2e/storefront/ux/error-pages.spec.ts` (suite **Error pages**) and
`tests/e2e/storefront/ux/accessibility.spec.ts` (suite **Accessibility**), tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-UX-001 | Open `/qa-e2e-this-page-does-not-exist` | HTTP 404; title "Page Not Found"; H1 "Page not Found" | P |
| ASP-UX-002 | Home → read accessible names of header icons | Account "My Account", Search "Search", cart contains "cart". **Known defect: cart icon has no name** (`test.fail`) | P |

## MOB: Mobile layout

Spec `tests/e2e/storefront/ux/mobile.spec.ts`, suite **Mobile layout**, tags `@mobile @smoke @production`.
Project `chromium-mobile` (Pixel 7).

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-MOB-001 | Open home | Page width ≤ viewport (no horizontal scroll) | P |
| ASP-MOB-002 | Tap the menu icon → tap **Custom Stickers** (the phone label of Stickers) | Menu shows Custom Stickers; URL `/custom/stickers` | P |

---

# Admin panel

## ADMA: Access

Spec `tests/e2e/admin/access/admin-login.spec.ts`, suites **Admin login** and **Admin route guard**,
tags `@admin @regression @production`. Read-only: **LOG IN is never submitted with credentials.**

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| ASP-ADMA-001 `@smoke` | Open the admin panel | Title "AllStickerPrinting \| Admin Panel"; logo; Email Address, Password (masked), Keep me signed in, LOG IN | P |
| ASP-ADMA-002 | Check LOG IN empty → type email → type password | Inactive when empty and with email only; active once both are filled | P |
| ASP-ADMA-003 | Type `not-an-email` in Email Address | "Invalid Email Address." | P |
| ASP-ADMA-004 | Type a password → click the eye icon | Password input type becomes `text` | P |
| ASP-ADMA-005 | Logged out, open `/orders` | Redirected to `/`; login form shown | P |
| ASP-ADMA-006 | Logged out, open `/orders/1` | Redirected to `/`; login form shown | P |
| ASP-ADMA-007 | Logged out, open `/dashboard` | Redirected to `/`; login form shown | P |
| ASP-ADMA-008 | Logged out, open `/members` | Redirected to `/`; login form shown | P |

## Planned

Not automated yet. Each will get the next ID in its module.

- Other configurators: kiss cut, sheet, roll, transparent, hologram, business cards, pin buttons,
  magnets, hang tags.
- Sample pack ordering, vinyl lettering designer.
- Cart editing and removal, artwork upload, guest checkout up to payment (dev only).
- Member account pages and guest order lookup with a real order (dev only).
- Admin: signed-in session fixture, order list and order detail (read-only), then order processing
  journeys from storefront to admin (`ASP-ADMO`, dev only).
- Accessibility (axe) checks like Musticker's `MS-UX` cases.
