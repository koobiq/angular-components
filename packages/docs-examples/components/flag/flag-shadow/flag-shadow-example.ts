import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Flag inset shadow
 */
@Component({
    selector: 'flag-shadow-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="layout-row layout-wrap layout-align-center-center layout-gap-m example-flag-grid">
            @for (country of countries; track country.code) {
                <kbq-flag shadow="inset" [label]="country.name">
                    <img alt="" [src]="country.code | flagSrc" />
                </kbq-flag>
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
export class FlagShadowExample {
    // A mix of flags that are prone to blending into light or dark backgrounds.
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
