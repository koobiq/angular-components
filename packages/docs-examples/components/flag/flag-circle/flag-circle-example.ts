import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import * as flags1x1 from 'country-flag-icons/string/1x1';

/**
 * @title Circular flags
 */
@Component({
    selector: 'flag-circle-example',
    imports: [KbqFlag],
    template: `
        @for (country of countries; track country.code) {
            <kbq-flag shape="circle" [label]="country.name" [innerHTML]="country.svg" />
        }
    `,
    styles: `
        :host {
            font-size: 32px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-gap-m'
    }
})
export class FlagCircleExample {
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly countries = [
        { code: 'AO', name: 'Angola' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'UY', name: 'Uruguay' }
    ].map((country) => ({ ...country, svg: this.sanitizer.bypassSecurityTrustHtml(flags1x1[country.code]) }));
}
