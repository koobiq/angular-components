import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Square flags
 */
@Component({
    selector: 'flag-square-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="example-flag-row">
            @for (country of countries; track country.code) {
                <kbq-flag shape="square" [label]="country.name">
                    <img alt="" [src]="country.code | flagSrc: 'square'" />
                </kbq-flag>
            }
        </div>
    `,
    styles: `
        .example-flag-row {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
            font-size: 24px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagSquareExample {
    protected readonly countries = [
        { code: 'EU', name: 'European Union' },
        { code: 'NO', name: 'Norway' },
        { code: 'KR', name: 'South Korea' },
        { code: 'RU', name: 'Russia' }
    ];
}
