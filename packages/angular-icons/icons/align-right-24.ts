import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-align-right-24,[kbqAlignRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M24 20.7V18.9a.3.3 0 0 0-.3-.3H9.3a.3.3 0 0 0-.3.3V20.7a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3M24 10.3a.3.3 0 0 1-.3.3H9.166a.3.3 0 0 1-.3-.3V8.5a.3.3 0 0 1 .3-.3H23.7a.3.3 0 0 1 .3.3zM24 15.5a.3.3 0 0 1-.3.3H.3a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h23.4a.3.3 0 0 1 .3.3zM24 5.099a.3.3 0 0 1-.3.3H.3a.3.3 0 0 1-.3-.3V3.3A.3.3 0 0 1 .3 3h23.4a.3.3 0 0 1 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAlignRight24 extends KbqSvgIcon {}
