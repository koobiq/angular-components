import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import * as flags3x2 from 'country-flag-icons/string/3x2';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Flag overview
 */
@Component({
    selector: 'flag-overview-example',
    imports: [KbqFlag],
    template: `
        <div class="layout-row layout-wrap layout-align-center-center layout-gap-m example-flag-grid">
            @for (country of countries(); track country.name) {
                <kbq-flag [label]="country.name" [svg]="country.svg" />
            }
        </div>
    `,
    styles: `
        .example-flag-grid {
            font-size: 32px;
            max-width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-m'
    }
})
export class FlagOverviewExample extends BaseLocalizedExample<ExampleText> {
    private readonly sanitizer = inject(DomSanitizer);

    // A mix of flags, including several that are prone to blending into light or dark backgrounds.
    // Subdivision codes are exported with underscores (GB-ENG → GB_ENG).
    private readonly countryCodes = ['BR', 'BG', 'ID', 'MF', 'UY', 'YT', 'PK', 'IL', 'GB_ENG', 'FI', 'BE', 'CW', 'KR'];

    protected readonly countries = computed(() =>
        this.countryCodes.map((code, index) => ({
            code,
            name: this.text().overviewCountries[index],
            svg: this.sanitizer.bypassSecurityTrustHtml(flags3x2[code])
        }))
    );

    constructor() {
        super(TEXT);
    }
}
