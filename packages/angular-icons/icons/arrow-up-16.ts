import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-16,[kbqArrowUp16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m7.181 4.084-3.505 3.52a.2.2 0 0 1-.281 0l-.853-.856a.2.2 0 0 1 0-.285l5.3-5.322a.2.2 0 0 1 .282 0l5.3 5.322a.2.2 0 0 1 0 .285l-.851.856a.2.2 0 0 1-.282 0l-3.505-3.52v10.797a.2.2 0 0 1-.2.201H7.38a.2.2 0 0 1-.199-.201z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUp16 extends KbqSvgIcon {}
