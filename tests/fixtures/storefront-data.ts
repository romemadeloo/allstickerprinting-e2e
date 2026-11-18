// Storefront copy and test data. Page objects and specs read text from here, never inline.

export const nav = {
  primary: [
    // On phones the same menu item reads "Custom Stickers".
    { name: 'Stickers', mobileName: 'Custom Stickers', path: '/custom/stickers', h1: 'Stickers' },
    { name: 'Business Card', path: '/business-cards', h1: 'Business Cards' },
    { name: 'Buttons & Magnets', path: '/buttons-and-magnets', h1: 'Buttons & Magnets' },
    { name: 'Get Samples', path: '/sample-pack', h1: 'Sticker Sample Pack' }
  ]
} as const;

/**
 * Public pages that must answer 200 with the given H1 and title. Case IDs ASP-NAV-### come from the
 * position in this list: add new pages at the END so existing IDs don't shift.
 */
export const publicPages = [
  { path: '/', h1: 'Custom Stickers', title: /Custom Sticker Printing/ },
  { path: '/custom/stickers', h1: 'Stickers', title: /Shop Stickers for Any Need/ },
  { path: '/stickers/die-cut', h1: 'Die Cut Stickers', title: /Custom Die Cut Stickers/ },
  { path: '/stickers/kiss-cut', h1: 'Kiss Cut Stickers', title: /Custom Kiss Cut Stickers/ },
  { path: '/stickers/sheet', h1: 'Sticker Sheets', title: /Custom Sticker Sheets/ },
  { path: '/stickers/roll', h1: 'Roll Stickers', title: /Custom Roll Stickers/ },
  { path: '/stickers/paper/art', h1: 'Art Paper Stickers', title: /Art Paper Stickers/ },
  { path: '/stickers/vinyl/transparent', h1: 'Transparent Stickers', title: /Custom Clear Stickers/ },
  { path: '/stickers/special/hologram', h1: 'Hologram Stickers', title: /Custom Holographic Stickers/ },
  { path: '/business-cards', h1: 'Business Cards', title: /Custom Business Cards/ },
  { path: '/business-cards/standard-business-card', h1: 'Standard Business Cards', title: /Standard Business Cards/ },
  { path: '/buttons-and-magnets', h1: 'Buttons & Magnets', title: /Buttons & Magnets/ },
  { path: '/buttons/pin-button', h1: 'Pin Buttons', title: /Custom Pin Buttons/ },
  { path: '/magnets/custom-magnet', h1: 'Custom Magnets', title: /Custom Printed Magnets/ },
  { path: '/hang-tags', h1: 'Hang Tags', title: /Custom Hang Tags/ },
  { path: '/sample-pack', h1: 'Sticker Sample Pack', title: /Sticker Samples/ },
  { path: '/vinyl-lettering-designer', h1: 'Vinyl Lettering Designer', title: /Custom Vinyl Lettering/ },
  { path: '/about', h1: 'Who We Are', title: /About AllStickerPrinting/ },
  { path: '/user-guide/faq', h1: 'FAQ', title: /Frequently Asked Questions/ },
  { path: '/user-guide/artwork-guide', h1: 'Artwork Guide', title: /Artwork Guide/ },
  { path: '/success-stories', h1: 'Success Stories', title: /Success Stories/ },
  { path: '/blog', h1: 'Blogs', title: /Blogs/ },
  { path: '/sitemap', h1: 'Site Map', title: /Sitemap/ },
  { path: '/terms-and-condition', h1: 'Terms and Conditions', title: /Terms & Conditions/ },
  { path: '/privacy-policy', h1: 'Privacy Policy', title: /Privacy Policy/ }
] as const;

/** Old paths that must redirect. */
export const redirects = [{ from: '/stickers', to: '/custom/stickers' }] as const;

export const footerLinks = [
  { name: 'Die Cut Stickers', path: '/stickers/die-cut' },
  { name: 'Standard Business Card', path: '/business-cards/standard-business-card' },
  { name: 'Hang Tags', path: '/hang-tags' },
  { name: 'Pin Buttons', path: '/buttons/pin-button' },
  { name: 'About Us', path: '/about' },
  { name: 'FAQ', path: '/user-guide/faq' },
  { name: 'Artwork Guide', path: '/user-guide/artwork-guide' },
  { name: 'Terms of Service', path: '/terms-and-condition' },
  { name: 'Privacy Policy', path: '/privacy-policy' }
] as const;

export const contactEmail = 'info@allstickerprinting.com';

export const auth = {
  signInHeading: 'Sign In to your account',
  registerHeading: 'New Member Registration',
  tabs: { member: 'Member', nonMember: 'Non-member' },
  labels: {
    email: 'Email Address',
    password: 'Password',
    orderNumber: 'Order Number',
    firstName: 'First Name',
    lastName: 'Last Name'
  },
  buttons: {
    openSignIn: 'Sign in to Account',
    openRegister: 'Register',
    signIn: 'Sign In',
    register: 'Register',
    checkOrder: 'Check Your Order',
    facebook: 'Login with Facebook',
    google: 'Login with Google'
  },
  errors: {
    emailRequired: 'Email address is required. Please try again.',
    passwordRequired: 'Password is required. Please try again.',
    invalidEmail: 'Please enter a valid email.',
    badCredentials: 'Your email address and password do not match.',
    firstNameRequired: 'First name is required. Please try again.',
    lastNameRequired: 'Last name is required. Please try again.'
  },
  // Reserved domain: never a real account.
  unknownMember: { email: 'qa-e2e-nobody@example.com', password: 'WrongPass123!' }
} as const;

export const search = {
  placeholder: 'Search products or uses...',
  hit: { query: 'hologram', result: /Hologram Stickers/, path: '/stickers/special/hologram' },
  miss: { query: 'zzqqxx-no-such-product' },
  noMatches: 'No matches found.',
  sections: { products: 'Products', uses: 'Uses' }
} as const;

export const cart = {
  emptyDropdown: 'There are no items in the cart.',
  pageHeading: /Cart \(\d+\)/,
  emptyPageHeading: 'Cart (0)'
} as const;

export const dieCut = {
  path: '/stickers/die-cut',
  heading: 'Die Cut Stickers',
  defaults: { summary: 'Die Cut / Square / 1.2x1.2in / Gloss / Normal / Qty : 100', width: '1.2', height: '1.2' },
  finishes: ['Gloss', 'Matte', 'Uncoated'],
  materials: ['Art Paper', 'Classic Paper', 'Kraft Paper'],
  quantities: { next: '200', more: ['300', '400', '500', '1000', '5000', '10000'], pick: '1000' },
  sizes: { valid: '2', tooSmall: '0.2', special: '30' },
  minSizeMessage: '* Width or height must not be below 1.2x1.2in for Die Cut.',
  specialSizeMessage: '* For special sizes, request a quote from the button below.',
  quantityRule: /We only accept those that are divisible by/,
  seeMore: 'See More',
  customQuantity: 'Custom Qty',
  addToCart: 'Add to Cart',
  totalPrice: 'Total Price',
  artworkModal: { skip: 'Skip & upload artwork later *' }
} as const;

export const notFound = {
  path: '/qa-e2e-this-page-does-not-exist',
  title: /Page Not Found/,
  h1: 'Page not Found'
} as const;

/**
 * Product defects the suite knows about. A test that checks one is marked `test.fail()` while the
 * entry exists, so the run stays green and turns red the day the defect is fixed (then delete the
 * entry). Add the Jira key once it is filed.
 */
export const knownDefects = {
  quantityDivisorZero: {
    note: 'Sticker configurators say "We only accept those that are divisible by 0. For example 10, 20, 30" (seen 2026-11-18 on die-cut, kiss-cut, transparent).',
    ticket: undefined as string | undefined
  }
} as const;
