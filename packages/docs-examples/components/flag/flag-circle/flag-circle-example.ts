import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import * as flags1x1 from 'country-flag-icons/string/1x1';
import { injectExampleText } from '../l10n';

/**
 * @title Circular flags
 */
@Component({
    selector: 'flag-circle-example',
    imports: [KbqFlag],
    template: `
        @for (country of countries(); track country.code) {
            <kbq-flag shape="circle" [label]="country.name" [svg]="country.svg" />
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
    protected readonly text = injectExampleText();

    private readonly sanitizer = inject(DomSanitizer);

    private readonly countryCodes = ['AO', 'MY', 'UY'];

    protected readonly countries = computed(() =>
        this.countryCodes.map((code, index) => ({
            code,
            name: this.text().circleCountries[index],
            svg: this.sanitizer.bypassSecurityTrustHtml(flags1x1[code])
        }))
    );
}
