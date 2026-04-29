import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-up-16,[kbqArrowsUp16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.406 1.059a.2.2 0 0 0-.284 0L.809 5.367a.2.2 0 0 0 0 .285l.855.854a.2.2 0 0 0 .284 0l2.51-2.508v10.8c0 .112.09.202.201.202h1.21c.11 0 .2-.09.2-.201V3.998L8.58 6.506a.2.2 0 0 0 .284 0l.855-.854a.2.2 0 0 0 0-.285zM10.13 15c-.11 0-.2-.09-.2-.201V7.148l1.61-1.61v9.26c0 .112-.09.202-.2.202zm1.41-11.002V5.48L8.855 2.797l1.74-1.738a.2.2 0 0 1 .284 0l4.313 4.308a.2.2 0 0 1 0 .285l-.855.854a.2.2 0 0 1-.284 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsUp16 extends KbqSvgIcon {}
