<!-- lockally-brand-header -->
<p align="center">
  <a href="https://lockally.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/LockallyInc/community/main/brand/lockup-dark.png">
      <img alt="Lockally" src="https://raw.githubusercontent.com/LockallyInc/community/main/brand/lockup-light.png" width="260">
    </picture>
  </a>
</p>
<!-- /lockally-brand-header -->

# @lockally/angular

Official [Lockally](https://lockally.com) Angular components for embedding
transactional email into your app: `EmailComposer`, `ContactPicker`,
`AttachmentUpload`, `TemplateSelector`, `SignaturePicker`.

## Install

```bash
npm install @lockally/angular @lockally/ui-core
```

## Secure setup (never ship a secret key in the browser)

A `lk_live_` / `lk_test_` key must **never** run in browser code. Provide a
`getToken()` that fetches a **short-lived token from your backend** (which holds the
secret key), or point `baseUrl` at your own proxy.

Standalone app:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideLockally } from '@lockally/angular';

bootstrapApplication(AppComponent, {
  providers: [provideLockally({ getToken: async () => (await fetch('/api/lockally-token')).json().then(j => j.token) })],
});
```

NgModule app:

```ts
import { LockallyModule } from '@lockally/angular';

@NgModule({
  imports: [LockallyModule.forRoot({ getToken })],
})
export class AppModule {}
```

## Use

```html
<lockally-email-composer
  defaultFrom="alerts@yourdomain.com"
  (sent)="onSent($event)"
  (errored)="onError($event)"
></lockally-email-composer>
```

## Components

| Selector | Purpose |
|---|---|
| `<lockally-email-composer>` | Compose form → `POST /v1/send`. Outputs `sent` / `errored`. |
| `<lockally-contact-picker>` | Search contacts (`GET /v1/contacts?q=`). Output `select`. |
| `<lockally-template-selector>` | Pick a stored template (`GET /v1/templates`). Output `select`. |
| `<lockally-attachment-upload>` | `File` → base64; two-way `[(value)]` of `Attachment[]`. |
| `<lockally-signature-picker>` | **Prop-driven** — pass `[signatures]`; output `select`. Lockally has no public signatures API. |

Each is a standalone component (also re-exported from `LockallyModule`). Inject
`LockallyService` for `send` / `listContacts` / `listTemplates` directly. Every element
carries a `data-lockally="…"` hook for your own CSS.

## License

MIT © Lockally
