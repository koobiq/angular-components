import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSvgPipe } from '../flag-string.pipe';

/**
 * @title Square flags
 */
@Component({
    selector: 'flag-square-example',
    imports: [KbqFlag, FlagSvgPipe],
    template: `
        @for (country of countries; track country.code) {
            <kbq-flag shape="square" [label]="country.name" [innerHTML]="country.code | flagSvg: 'square'" />
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
    protected readonly countries = [
        { code: 'EU', name: 'European Union' },
        { code: 'NO', name: 'Norway' },
        { code: 'KR', name: 'South Korea' },
        { code: 'RU', name: 'Russia' }
    ];
}
