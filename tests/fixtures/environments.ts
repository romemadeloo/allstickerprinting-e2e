// The only place AllStickerPrinting server URLs are written. Specs and page objects never hardcode hosts.
export type EnvironmentConfig = {
  baseUrl: string;
  apiBaseUrl: string;
  adminPanel: string;
  // Production is live customer data: specs that write are refused there, and the write guard in
  // asp-test.ts aborts mutating API calls that are not on the allowlist.
  isProduction: boolean;
};

export type EnvironmentName = 'production' | 'dev';

const productionHosts = [
  'www.allstickerprinting.com',
  'allstickerprinting.com',
  'api.allstickerprinting.com',
  'admin-panel-v2.allstickerprinting.com'
];

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`E2E_ENVIRONMENT=dev needs ${name} in .env. Ask the QA lead which dev server to use.`);
  }
  if (productionHosts.includes(new URL(value).hostname)) {
    throw new Error(`${name} points at production (${value}). Use E2E_ENVIRONMENT=production instead.`);
  }
  return value.replace(/\/$/, '');
}

export function resolveEnvironment(name: string): EnvironmentConfig & { name: EnvironmentName } {
  if (name === 'production') {
    return {
      name,
      baseUrl: 'https://www.allstickerprinting.com',
      apiBaseUrl: 'https://api.allstickerprinting.com/index.php',
      adminPanel: 'https://admin-panel-v2.allstickerprinting.com',
      isProduction: true
    };
  }

  if (name === 'dev') {
    return {
      name,
      baseUrl: required('ASP_DEV_BASE_URL'),
      apiBaseUrl: required('ASP_DEV_API_URL'),
      adminPanel: required('ASP_DEV_ADMIN_URL'),
      isProduction: false
    };
  }

  throw new Error(`Unsupported E2E_ENVIRONMENT "${name}". Use production or dev.`);
}
