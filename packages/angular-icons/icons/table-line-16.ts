import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-table-line-16,[kbqTableLine16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 1A1.2 1.2 0 0 0 1 2.2v11.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2V2.2A1.2 1.2 0 0 0 13.8 1zm.4 5H5v7.4H2.8a.2.2 0 0 1-.2-.2zm0-1.6V2.8c0-.11.09-.2.2-.2H5v1.8zm4 1.6h6.8v7.2a.2.2 0 0 1-.2.2H6.6zm6.8-1.6H6.6V2.6h6.6c.11 0 .2.09.2.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTableLine16 extends KbqSvgIcon {}
