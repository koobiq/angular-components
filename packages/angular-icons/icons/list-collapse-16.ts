import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-collapse-16,[kbqListCollapse16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4.39 2.773V.45a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v2.323H1.2a.201.201 0 0 0-.17.307l2.39 3.843a.2.2 0 0 0 .34 0L6.147 3.08a.201.201 0 0 0-.17-.307zM8.297 3.56a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM15 8.56a.2.2 0 0 1-.2.2H6.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h8.6c.11 0 .2.09.2.2zM14.8 13.96a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H8.299a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2zM2.79 13.227v2.323c0 .11.089.2.2.2h1.2a.2.2 0 0 0 .2-.2v-2.323h1.589a.201.201 0 0 0 .17-.308l-2.39-3.842a.2.2 0 0 0-.34 0L1.032 12.92a.201.201 0 0 0 .17.308z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqListCollapse16 extends KbqSvgIcon {}
