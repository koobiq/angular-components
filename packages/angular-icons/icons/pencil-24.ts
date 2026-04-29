import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pencil-24,[kbqPencil24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M18.587 2.027a1.8 1.8 0 0 0-2.544 0l-1.285 1.285 5.93 5.93 1.285-1.285a1.8 1.8 0 0 0 0-2.544zM19.416 10.515l-5.93-5.931-9.532 9.532 5.93 5.93zM1.95 22.405a.3.3 0 0 1-.355-.355l1.347-6.401 5.41 5.409z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPencil24 extends KbqSvgIcon {}
