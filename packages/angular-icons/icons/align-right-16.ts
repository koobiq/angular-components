import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-align-right-16,[kbqAlignRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M16 13.8v-1.2a.2.2 0 0 0-.2-.2H6.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h9.6a.2.2 0 0 0 .2-.2M16 6.866a.2.2 0 0 1-.2.2H6.11a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.69c.11 0 .2.09.2.2zM16 10.333a.2.2 0 0 1-.2.2H.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h15.6c.11 0 .2.09.2.2zM16 3.4a.2.2 0 0 1-.2.2H.2a.2.2 0 0 1-.2-.2V2.2c0-.11.09-.2.2-.2h15.6c.11 0 .2.09.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAlignRight16 extends KbqSvgIcon {}
