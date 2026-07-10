import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import * as flags1x1 from 'country-flag-icons/string/1x1';

/**
 * @title Square flags
 */
@Component({
    selector: 'flag-square-example',
    imports: [KbqFlag],
    template: `
        @for (country of countries; track country.code) {
            <kbq-flag shape="square" [label]="country.name" [innerHTML]="country.svg" />
        }
    `,
    styles: `
        :host {
            font-size: 64px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-gap-l'
    }
})
export class FlagSquareExample {
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly countries = [
        { code: 'EU', name: 'European Union' },
        { code: 'NO', name: 'Norway' },
        { code: 'KR', name: 'South Korea' },
        { code: 'RU', name: 'Russia' }
    ].map((country) => ({ ...country, svg: this.sanitizer.bypassSecurityTrustHtml(flags1x1[country.code]) }));
}
