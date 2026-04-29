import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pencil-16,[kbqPencil16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M12.391 1.351a1.2 1.2 0 0 0-1.696 0l-.857.857 3.954 3.954.857-.857a1.2 1.2 0 0 0 0-1.696zM12.944 7.01 8.99 3.056 2.636 9.411l3.953 3.953zM1.3 14.937a.2.2 0 0 1-.237-.237l.899-4.267 3.606 3.605z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPencil16 extends KbqSvgIcon {}
