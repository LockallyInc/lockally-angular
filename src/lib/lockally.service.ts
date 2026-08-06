import { Inject, Injectable, Optional } from '@angular/core';
import {
  LockallyClient,
  type Contact,
  type SendMessage,
  type SendResult,
  type Template,
} from '@lockally/ui-core';
import { LOCKALLY_CONFIG, type LockallyConfig } from './lockally.config';

/** Injectable wrapper over the browser-safe Lockally client. */
@Injectable({ providedIn: 'root' })
export class LockallyService {
  private readonly client: LockallyClient;

  constructor(@Optional() @Inject(LOCKALLY_CONFIG) config: LockallyConfig | null) {
    this.client = new LockallyClient(config ?? {});
  }

  send(message: SendMessage): Promise<SendResult> {
    return this.client.send(message);
  }

  listContacts(q?: string): Promise<Contact[]> {
    return this.client.listContacts(q);
  }

  listTemplates(): Promise<Template[]> {
    return this.client.listTemplates();
  }
}
