import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-minus-s-24,[kbqCircleMinusS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.636 18.364A9 9 0 1 0 18.364 5.636 9 9 0 0 0 5.636 18.364M7.8 11.1h8.4a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H7.8a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleMinusS24 extends KbqSvgIcon {}
