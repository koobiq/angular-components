import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSvgPipe } from '../flag-string.pipe';

/**
 * @title Flag overview
 */
@Component({
    selector: 'flag-overview-example',
    imports: [KbqFlag, FlagSvgPipe],
    template: `
        <div class="layout-row layout-wrap layout-align-center-center layout-gap-m example-flag-grid">
            @for (country of countries; track country.code) {
                <kbq-flag [label]="country.name" [innerHTML]="country.code | flagSvg" />
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
    // A mix of flags, including several that are prone to blending into light or dark backgrounds.
    protected readonly countries = [
        { code: 'BR', name: 'Brazil' },
        { code: 'BG', name: 'Bulgaria' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'MF', name: 'Saint Martin' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'YT', name: 'Mayotte' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'IL', name: 'Israel' },
        { code: 'GB-ENG', name: 'England' },
        { code: 'FI', name: 'Finland' },
        { code: 'BE', name: 'Belgium' },
        { code: 'CW', name: 'Curaçao' },
        { code: 'KR', name: 'South Korea' }
    ];
}
