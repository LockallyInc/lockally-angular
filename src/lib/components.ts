import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  fileToAttachment,
  type Attachment,
  type Contact,
  type SendMessage,
  type SendResult,
  type Signature,
  type Template,
} from '@lockally/ui-core';
import { LockallyService } from './lockally.service';

// Components are lightly styled — each root carries a `data-lockally` hook, so you
// theme with your own CSS. No stylesheet required.

// ── SignaturePicker (prop-driven; Lockally has no public signatures API) ───────

@Component({
  selector: 'lockally-signature-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select data-lockally="signature-picker" aria-label="Choose a signature" (change)="onChange($event)">
      <option value="" disabled selected>Choose a signature…</option>
      <option *ngFor="let s of signatures" [value]="s.id">{{ s.name }}</option>
    </select>
  `,
})
export class SignaturePickerComponent {
  @Input() signatures: Signature[] = [];
  @Output() select = new EventEmitter<Signature>();

  onChange(e: Event): void {
    const s = this.signatures.find((x) => x.id === (e.target as HTMLSelectElement).value);
    if (s) this.select.emit(s);
  }
}

// ── TemplateSelector ─────────────────────────────────────────────────────────

@Component({
  selector: 'lockally-template-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select data-lockally="template-selector" aria-label="Choose a template" [disabled]="loading" (change)="onChange($event)">
      <option value="" disabled selected>{{ loading ? 'Loading templates…' : 'Choose a template…' }}</option>
      <option *ngFor="let t of data" [value]="t.id">{{ t.name }}</option>
    </select>
  `,
})
export class TemplateSelectorComponent implements OnInit {
  @Output() select = new EventEmitter<Template>();
  data: Template[] = [];
  loading = true;

  constructor(private lockally: LockallyService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.data = await this.lockally.listTemplates();
    } catch {
      this.data = [];
    } finally {
      this.loading = false;
    }
  }

  onChange(e: Event): void {
    const t = this.data.find((x) => x.id === (e.target as HTMLSelectElement).value);
    if (t) this.select.emit(t);
  }
}

// ── ContactPicker ────────────────────────────────────────────────────────────

@Component({
  selector: 'lockally-contact-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div data-lockally="contact-picker">
      <input type="search" [(ngModel)]="q" (ngModelChange)="search()" aria-label="Search contacts" [attr.placeholder]="placeholder" />
      <ul data-lockally="contact-list">
        <li *ngIf="loading" data-lockally="loading">Loading…</li>
        <li *ngFor="let c of data">
          <button type="button" (click)="select.emit(c)">{{ c.name ? c.name + ' <' + c.email + '>' : c.email }}</button>
        </li>
      </ul>
    </div>
  `,
})
export class ContactPickerComponent implements OnInit {
  @Input() placeholder = 'Search contacts…';
  @Output() select = new EventEmitter<Contact>();
  q = '';
  data: Contact[] = [];
  loading = false;
  private seq = 0;

  constructor(private lockally: LockallyService) {}

  ngOnInit(): void {
    void this.search();
  }

  async search(): Promise<void> {
    const query = this.q.trim() || undefined;
    const mine = ++this.seq;
    this.loading = true;
    try {
      const result = await this.lockally.listContacts(query);
      if (mine === this.seq) this.data = result;
    } catch {
      if (mine === this.seq) this.data = [];
    } finally {
      if (mine === this.seq) this.loading = false;
    }
  }
}

// ── AttachmentUpload ─────────────────────────────────────────────────────────

@Component({
  selector: 'lockally-attachment-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div data-lockally="attachment-upload">
      <input type="file" multiple aria-label="Add attachments" (change)="onFiles($event)" />
      <ul data-lockally="attachment-list">
        <li *ngFor="let a of value; let i = index">
          <span>{{ a.filename }}</span>
          <button type="button" [attr.aria-label]="'Remove ' + a.filename" (click)="remove(i)">×</button>
        </li>
      </ul>
    </div>
  `,
})
export class AttachmentUploadComponent {
  @Input() value: Attachment[] = [];
  @Output() valueChange = new EventEmitter<Attachment[]>();

  async onFiles(e: Event): Promise<void> {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const added = await Promise.all(Array.from(files).map(fileToAttachment));
    this.value = [...this.value, ...added];
    this.valueChange.emit(this.value);
  }

  remove(i: number): void {
    this.value = this.value.filter((_, j) => j !== i);
    this.valueChange.emit(this.value);
  }
}

// ── EmailComposer ────────────────────────────────────────────────────────────

@Component({
  selector: 'lockally-email-composer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TemplateSelectorComponent,
    SignaturePickerComponent,
    AttachmentUploadComponent,
  ],
  template: `
    <form data-lockally="email-composer" (ngSubmit)="submit()">
      <input aria-label="From" placeholder="From" name="from" [(ngModel)]="from" />
      <input aria-label="To" placeholder="To (comma-separated)" name="to" [(ngModel)]="to" />
      <input aria-label="Cc" placeholder="Cc" name="cc" [(ngModel)]="cc" />
      <input aria-label="Subject" placeholder="Subject" name="subject" [(ngModel)]="subject" />
      <lockally-template-selector (select)="onTemplate($event)"></lockally-template-selector>
      <textarea aria-label="Body" placeholder="Write your message…" name="body" [(ngModel)]="body"></textarea>
      <lockally-signature-picker
        *ngIf="signatures && signatures.length"
        [signatures]="signatures"
        (select)="body = body + $event.html"
      ></lockally-signature-picker>
      <lockally-attachment-upload [(value)]="attachments"></lockally-attachment-upload>
      <p *ngIf="error" role="alert" data-lockally="error">{{ error }}</p>
      <button type="submit" [disabled]="sending || !from || !to.trim()">{{ sending ? 'Sending…' : 'Send' }}</button>
    </form>
  `,
})
export class EmailComposerComponent implements OnInit {
  @Input() defaultFrom = '';
  @Input() defaultTo = '';
  @Input() signatures?: Signature[];
  @Output() sent = new EventEmitter<SendResult>();
  @Output() errored = new EventEmitter<Error>();

  from = '';
  to = '';
  cc = '';
  subject = '';
  body = '';
  attachments: Attachment[] = [];
  templateId?: string;
  sending = false;
  error?: string;

  constructor(private lockally: LockallyService) {}

  ngOnInit(): void {
    this.from = this.defaultFrom;
    this.to = this.defaultTo;
  }

  onTemplate(t: Template): void {
    this.templateId = t.id;
    if (t.subject) this.subject = t.subject;
    if (t.html) this.body = t.html;
  }

  private split(v: string): string[] {
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }

  async submit(): Promise<void> {
    this.sending = true;
    this.error = undefined;
    try {
      const message: SendMessage = {
        from: this.from,
        to: this.split(this.to),
        ...(this.cc.trim() ? { cc: this.split(this.cc) } : {}),
        ...(this.subject ? { subject: this.subject } : {}),
        ...(this.templateId ? { template_id: this.templateId } : { html: this.body }),
        ...(this.attachments.length ? { attachments: this.attachments } : {}),
      };
      const result = await this.lockally.send(message);
      this.sent.emit(result);
      this.body = '';
      this.attachments = [];
      this.templateId = undefined;
    } catch (err) {
      this.error = (err as Error).message;
      this.errored.emit(err as Error);
    } finally {
      this.sending = false;
    }
  }
}
