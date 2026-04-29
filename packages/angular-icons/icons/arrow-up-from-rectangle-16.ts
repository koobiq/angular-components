import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-from-rectangle-16,[kbqArrowUpFromRectangle16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M7.2 4.063 5.664 5.599a.2.2 0 0 1-.283 0l-.849-.848a.2.2 0 0 1 0-.283L7.86 1.14a.2.2 0 0 1 .282 0l3.327 3.327a.2.2 0 0 1 0 .283l-.849.848a.2.2 0 0 1-.283 0L8.8 4.063v7.368a.2.2 0 0 1-.2.2H7.4a.2.2 0 0 1-.2-.2z"
                />
                <path
                    d="M6 7H2.2A1.2 1.2 0 0 0 1 8.2v5.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2V8.2A1.2 1.2 0 0 0 13.8 7H10v1.6h3.2c.11 0 .2.09.2.2v4.4a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2V8.8c0-.11.09-.2.2-.2H6z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpFromRectangle16 extends KbqSvgIcon {}
