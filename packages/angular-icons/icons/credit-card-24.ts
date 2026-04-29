import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-credit-card-24,[kbqCreditCard24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.8 3A1.8 1.8 0 0 0 0 4.8v3h24v-3A1.8 1.8 0 0 0 22.2 3zM0 10.8v8.4A1.8 1.8 0 0 0 1.8 21h20.4a1.8 1.8 0 0 0 1.8-1.8v-8.4zm2.55 6.6a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCreditCard24 extends KbqSvgIcon {}
