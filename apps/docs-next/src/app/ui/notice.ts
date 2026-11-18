import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';

/** A line explaining what the site did, such as opening another page after a framework switch. */
@Component({
    selector: 'docs-next-notice',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="kbq-circle-info_16"></i>
        <span>{{ text() }}</span>
    `,
    styles: `
        :host {
            display: flex;
            align-items: flex-start;
            gap: var(--kbq-size-s);
            margin-bottom: var(--kbq-size-xl);
            padding: var(--kbq-size-m) var(--kbq-size-l);
            border-radius: var(--kbq-size-s);
            background: var(--kbq-background-theme-fade);
            color: var(--kbq-foreground-contrast);
            font-size: var(--kbq-typography-text-normal-font-size);
            line-height: var(--kbq-typography-text-normal-line-height);
        }

        .kbq-icon {
            margin-top: 2px;
            color: var(--kbq-icon-theme);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { role: 'status' }
})
export class DocsNextNotice {
    readonly text = input.required<string>();
}
