import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'e2e-typography-styles',
    template: `
        @for (selector of selectors; track selector) {
            <span [class]="selector">Koobiq Design System</span>
        }
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTypographyStyles'
    }
})
export class E2eTypographyStyles {
    readonly selectors = [
        'kbq-display-big',
        'kbq-display-big-strong',
        'kbq-display-normal',
        'kbq-display-normal-strong',
        'kbq-display-compact',
        'kbq-display-compact-strong',
        'kbq-headline',
        'kbq-title',
        'kbq-subheading',
        'kbq-navbar-title',
        'kbq-text-big',
        'kbq-text-big-medium',
        'kbq-text-big-strong',
        'kbq-caps-big',
        'kbq-caps-big-strong',
        'kbq-mono-big',
        'kbq-mono-big-strong',
        'kbq-tabular-big',
        'kbq-tabular-big-strong',
        'kbq-italic-big',
        'kbq-italic-big-strong',
        'kbq-text-normal',
        'kbq-text-normal-medium',
        'kbq-text-normal-strong',
        'kbq-caps-normal',
        'kbq-caps-normal-strong',
        'kbq-mono-normal',
        'kbq-mono-normal-medium',
        'kbq-mono-normal-strong',
        'kbq-mono-codeblock',
        'kbq-tabular-normal',
        'kbq-tabular-normal-strong',
        'kbq-italic-normal',
        'kbq-italic-normal-strong',
        'kbq-text-compact',
        'kbq-text-compact-medium',
        'kbq-text-compact-strong',
        'kbq-caps-compact',
        'kbq-caps-compact-strong',
        'kbq-mono-compact',
        'kbq-mono-compact-strong',
        'kbq-tabular-compact',
        'kbq-tabular-compact-strong',
        'kbq-italic-compact',
        'kbq-italic-compact-strong'
    ] as const;
}
