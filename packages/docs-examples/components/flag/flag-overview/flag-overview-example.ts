import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Flag overview
 */
@Component({
    selector: 'flag-overview-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="layout-column layout-gap-s">
            @for (country of countries; track country.code) {
                <span>
                    <kbq-flag decorative>
                        <img alt="" [src]="country.code | flagSrc" />
                    </kbq-flag>
                    {{ country.name }}
                </span>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagOverviewExample {
    protected readonly countries = [
        { code: 'AL', name: 'Albania' },
        { code: 'NO', name: 'Norway' },
        { code: 'KR', name: 'South Korea' },
        { code: 'RU', name: 'Russia' }
    ];
}
