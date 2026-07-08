import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';
import * as flags3x2 from 'country-flag-icons/string/3x2';

/**
 * @title Flag overview
 */
@Component({
    selector: 'flag-overview-example',
    imports: [KbqFlag],
    template: `
        <div class="layout-row layout-wrap layout-align-center-center layout-gap-m example-flag-grid">
            @for (country of countries; track country.name) {
                <kbq-flag [label]="country.name" [innerHTML]="country.svg" />
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
export class FlagOverviewExample {
    private readonly sanitizer = inject(DomSanitizer);

    // A mix of flags, including several that are prone to blending into light or dark backgrounds.
    // Subdivision codes are exported with underscores (GB-ENG → GB_ENG).
    protected readonly countries = [
        { code: 'BR', name: 'Brazil' },
        { code: 'BG', name: 'Bulgaria' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'MF', name: 'Saint Martin' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'YT', name: 'Mayotte' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'IL', name: 'Israel' },
        { code: 'GB_ENG', name: 'England' },
        { code: 'FI', name: 'Finland' },
        { code: 'BE', name: 'Belgium' },
        { code: 'CW', name: 'Curaçao' },
        { code: 'KR', name: 'South Korea' }
    ].map((country) => ({ ...country, svg: this.sanitizer.bypassSecurityTrustHtml(flags3x2[country.code]) }));
}
