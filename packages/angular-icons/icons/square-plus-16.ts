import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-square-plus-16,[kbqSquarePlus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 1A1.2 1.2 0 0 0 1 2.2v11.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2V2.2A1.2 1.2 0 0 0 13.8 1zm5.26 10.943a.2.2 0 0 1-.06-.143V8.6H4.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h3.2V4.2a.2.2 0 0 1 .2-.2h.8c.11 0 .2.09.2.2v3.2h3.2a.2.2 0 0 1 .2.2v.8a.2.2 0 0 1-.033.11.2.2 0 0 1-.167.09H8.6v3.2a.2.2 0 0 1-.2.2h-.8a.2.2 0 0 1-.14-.057"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSquarePlus16 extends KbqSvgIcon {}
