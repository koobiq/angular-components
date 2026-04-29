import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-minus-16,[kbqCircleMinus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.8-7.8c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H4.2a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleMinus16 extends KbqSvgIcon {}
