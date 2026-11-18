import 'dotenv/config';
import { resolveEnvironment } from './environments.js';

export const env = resolveEnvironment(process.env.E2E_ENVIRONMENT?.trim() || 'production');

/** Hosts whose console errors and >=400 responses fail a test (third-party noise is ignored). */
export const ownHosts = [
  new URL(env.baseUrl).hostname,
  new URL(env.apiBaseUrl).hostname,
  new URL(env.adminPanel).hostname,
  'static.allstickerprinting.com'
];

export function isOwnHost(url: string): boolean {
  try {
    return ownHosts.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Absolute URL on the admin panel (specs use relative paths for the storefront only). */
export function adminUrl(path: string): string {
  return new URL(path, env.adminPanel).toString();
}

export const memberCredentials =
  process.env.ASP_MEMBER_EMAIL && process.env.ASP_MEMBER_PASSWORD
    ? { email: process.env.ASP_MEMBER_EMAIL, password: process.env.ASP_MEMBER_PASSWORD }
    : undefined;

export const runCartE2E = process.env.RUN_CART_E2E === 'true';
