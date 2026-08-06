import { InjectionToken, type Provider } from '@angular/core';
import type { GetToken } from '@lockally/ui-core';

export interface LockallyConfig {
  /** Async callback returning a short-lived bearer token from your backend. */
  getToken?: GetToken;
  /** Base URL / proxy. Default `https://api.lockally.com`. */
  baseUrl?: string;
}

/** DI token carrying the {@link LockallyConfig}. */
export const LOCKALLY_CONFIG = new InjectionToken<LockallyConfig>('LOCKALLY_CONFIG');

/**
 * Provide Lockally configuration for a standalone Angular app.
 *
 *   bootstrapApplication(App, { providers: [provideLockally({ getToken })] });
 *
 * Never pass a secret `lk_live_` key — supply `getToken` (short-lived token from
 * your backend) or a `baseUrl` proxy.
 */
export function provideLockally(config: LockallyConfig): Provider[] {
  return [{ provide: LOCKALLY_CONFIG, useValue: config }];
}
