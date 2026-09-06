import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import { CA } from 'country-flag-icons/string/3x2';

/**
 * @title Custom aspect ratio
 */
@Component({
    selector: 'flag-custom-ratio-example',
    imports: [KbqFlag],
    template: `
        <div class="layout-column layout-align-center-center layout-gap-s">
            <kbq-flag decorative [svg]="flag" />
            <span class="kbq-text-compact">3:2 — default</span>
        </div>
        <div class="layout-column layout-align-center-center layout-gap-s">
            <kbq-flag decorative class="example-flag-4x3" [svg]="flag" />
            <span class="kbq-text-compact">4:3</span>
        </div>
        <div class="layout-column layout-align-center-center layout-gap-s">
            <kbq-flag decorative class="example-flag-1x1" [svg]="flag" />
            <span class="kbq-text-compact">1:1</span>
        </div>
    `,
    styles: `
        .kbq-flag {
            font-size: 48px;
        }

        /* The token is declared at zero specificity, so a plain class rule overrides it. */
        .example-flag-4x3 {
            --kbq-flag-aspect-ratio: 4 / 3;
        }

        .example-flag-1x1 {
            --kbq-flag-aspect-ratio: 1 / 1;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-gap-xxl layout-padding-l'
    }
})
export class FlagCustomRatioExample {
    // The box keeps the flag cropped to the ratio it is given, so a source of any ratio fills it.
    protected readonly flag = inject(DomSanitizer).bypassSecurityTrustHtml(CA);
}
