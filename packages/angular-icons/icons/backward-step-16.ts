import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-backward-step-16,[kbqBackwardStep16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3 3.2c0-.11.09-.2.2-.2h1.6c.11 0 .2.09.2.2v9.6a.2.2 0 0 1-.2.2H3.2a.2.2 0 0 1-.2-.2zM5.356 7.848a.2.2 0 0 0 0 .304l7.314 4.56a.2.2 0 0 0 .33-.153V3.441a.2.2 0 0 0-.33-.152z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBackwardStep16 extends KbqSvgIcon {}
