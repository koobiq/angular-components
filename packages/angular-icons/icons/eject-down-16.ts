import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-eject-down-16,[kbqEjectDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="m15 4.805-6.836 9.11a.2.2 0 0 1-.328 0L1 4.805zM1 2.205c0-.11.09-.2.2-.2h13.6c.11 0 .2.09.2.2v1.4H1z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEjectDown16 extends KbqSvgIcon {}
