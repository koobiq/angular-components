import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-collapse-diagonal-16,[kbqArrowsCollapseDiagonal16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.397 5.732h2.918c.111 0 .202.091.202.203v1.123c0 .112-.09.202-.202.202H8.942a.2.2 0 0 1-.202-.202V1.686c0-.112.09-.202.202-.202h1.124c.111 0 .202.09.202.202v2.907l3.54-3.534a.2.2 0 0 1 .285 0l.848.849a.2.2 0 0 1 0 .286zM5.732 11.407l-3.54 3.534a.2.2 0 0 1-.285 0l-.848-.849a.2.2 0 0 1 0-.286l3.544-3.538H1.685a.2.2 0 0 1-.202-.203V8.942c0-.112.09-.202.202-.202h5.373c.111 0 .202.09.202.202v5.372c0 .112-.09.202-.202.202H5.935a.2.2 0 0 1-.203-.202z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsCollapseDiagonal16 extends KbqSvgIcon {}
