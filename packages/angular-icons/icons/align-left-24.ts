import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-align-left-24,[kbqAlignLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M0 20.7a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3V18.9a.3.3 0 0 0-.3-.3H.3a.3.3 0 0 0-.3.3zM0 10.3a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3V8.5a.3.3 0 0 0-.3-.3H.3a.3.3 0 0 0-.3.3zM0 15.5a.3.3 0 0 0 .3.3h23.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H.3a.3.3 0 0 0-.3.3zM0 5.099V3.3A.3.3 0 0 1 .3 3h23.4a.3.3 0 0 1 .3.3v1.799a.3.3 0 0 1-.3.3H.3a.3.3 0 0 1-.3-.3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAlignLeft24 extends KbqSvgIcon {}
