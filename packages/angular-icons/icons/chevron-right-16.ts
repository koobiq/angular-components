import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-right-16,[kbqChevronRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M9.33 8 4.559 3.191a.2.2 0 0 1 0-.284l.839-.846c.08-.081.212-.081.292 0l5.751 5.797a.2.2 0 0 1 0 .284L5.69 13.94a.206.206 0 0 1-.292 0l-.84-.845a.2.2 0 0 1 0-.285z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronRight16 extends KbqSvgIcon {}
