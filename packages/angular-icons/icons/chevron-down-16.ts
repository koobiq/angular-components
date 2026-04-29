import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-down-16,[kbqChevronDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m8 9.33 4.809-4.771a.2.2 0 0 1 .285 0l.845.839c.081.08.081.212 0 .292L8.142 11.44a.2.2 0 0 1-.284 0L2.06 5.69a.206.206 0 0 1 0-.292l.846-.84a.2.2 0 0 1 .284 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDown16 extends KbqSvgIcon {}
