import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Circular flags
 */
@Component({
    selector: 'flag-circle-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="example-flag-row">
            @for (country of countries; track country.code) {
                <kbq-flag shape="circle" [label]="country.name">
                    <img alt="" [src]="country.code | flagSrc: 'circle'" />
                </kbq-flag>
            }
        </div>
    `,
    styles: `
        .example-flag-row {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
            font-size: 32px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagCircleExample {
    protected readonly countries = [
        { code: 'AO', name: 'Angola' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'UY', name: 'Uruguay' }
    ];
}
