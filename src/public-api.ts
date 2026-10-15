export * from './lib/lockally.config';
export * from './lib/lockally.service';
export * from './lib/components';
export * from './lib/lockally.module';

// Re-export the core client + types for convenience.
export { LockallyClient, LockallyError, fileToAttachment } from '@lockally/ui-core';
export type {
  GetToken,
  LockallyAuth,
  Attachment,
  SendMessage,
  SendResult,
  Contact,
  Template,
  Signature,
} from '@lockally/ui-core';
