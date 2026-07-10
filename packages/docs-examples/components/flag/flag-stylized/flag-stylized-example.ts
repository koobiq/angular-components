import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import { BR } from 'country-flag-icons/string/3x2';

/**
 * @title Stylized flag
 */
@Component({
    selector: 'flag-stylized-example',
    imports: [KbqFlag],
    template: `
        <kbq-flag class="example-stylized-flag" shadow="none" label="Brazil" [innerHTML]="BR" />
    `,
    styles: `
        .example-stylized-flag {
            /* Rounded corners via the component's overridable radius token. */
            --kbq-flag-border-radius: var(--kbq-size-xs);

            font-size: 64px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Gradient imitating folds, blended over the flag. */
        .example-stylized-flag::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: linear-gradient(
                240.64deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(0, 0, 0, 0.27) 26.27%,
                rgba(255, 255, 255, 0.26) 37%,
                rgba(0, 0, 0, 0.55) 48.7%,
                rgba(0, 0, 0, 0.24) 59.44%,
                rgba(255, 255, 255, 0.3) 73.64%,
                rgba(39, 39, 39, 0.22) 90.15%,
                rgba(0, 0, 0, 0.2) 100%
            );
            mix-blend-mode: overlay;
            pointer-events: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-padding-xxl'
    }
})
export class FlagStylizedExample {
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly BR = this.sanitizer.bypassSecurityTrustHtml(BR);
}
