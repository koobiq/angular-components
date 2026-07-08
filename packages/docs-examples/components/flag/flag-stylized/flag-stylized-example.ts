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
        <kbq-flag stylized shadow="none" label="Brazil" [innerHTML]="BR" />
    `,
    styles: `
        .kbq-flag {
            font-size: 64px;
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
