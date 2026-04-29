import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-down-16,[kbqArrowDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m8.786 11.998 3.505-3.52a.2.2 0 0 1 .281 0l.853.856a.2.2 0 0 1 0 .285l-5.3 5.322a.2.2 0 0 1-.282 0l-5.3-5.322a.2.2 0 0 1 0-.285l.852-.856a.2.2 0 0 1 .28 0l3.506 3.52V1.2a.2.2 0 0 1 .2-.201h1.206c.11 0 .2.09.2.201z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowDown16 extends KbqSvgIcon {}
