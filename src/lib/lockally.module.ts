import { ModuleWithProviders, NgModule } from '@angular/core';
import { LOCKALLY_CONFIG, type LockallyConfig } from './lockally.config';
import {
  AttachmentUploadComponent,
  ContactPickerComponent,
  EmailComposerComponent,
  SignaturePickerComponent,
  TemplateSelectorComponent,
} from './components';

const COMPONENTS = [
  EmailComposerComponent,
  ContactPickerComponent,
  TemplateSelectorComponent,
  SignaturePickerComponent,
  AttachmentUploadComponent,
];

/**
 * Imports and re-exports the Lockally components. Use `LockallyModule.forRoot(config)`
 * once (in your root module) to supply the token-based auth config.
 *
 *   @NgModule({ imports: [LockallyModule.forRoot({ getToken })] })
 *   export class AppModule {}
 */
@NgModule({
  imports: COMPONENTS,
  exports: COMPONENTS,
})
export class LockallyModule {
  static forRoot(config: LockallyConfig): ModuleWithProviders<LockallyModule> {
    return {
      ngModule: LockallyModule,
      providers: [{ provide: LOCKALLY_CONFIG, useValue: config }],
    };
  }
}
