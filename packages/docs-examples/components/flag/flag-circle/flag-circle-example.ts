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
        @for (country of countries; track country.code) {
            <kbq-flag shape="circle" [label]="country.name">
                <img alt="" [src]="country.code | flagSrc: 'circle'" />
            </kbq-flag>
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
    protected readonly countries = [
        { code: 'AO', name: 'Angola' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'UY', name: 'Uruguay' }
    ];
}
