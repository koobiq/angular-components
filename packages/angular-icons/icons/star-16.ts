import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-star-16,[kbqStar16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M7.808 1.627a.21.21 0 0 1 .384 0l1.843 4.312 4.772.373a.208.208 0 0 1 .118.367l-3.632 3.028 1.111 4.534a.209.209 0 0 1-.31.229L8 12.036 3.906 14.47a.209.209 0 0 1-.31-.229l1.11-4.534-3.63-3.028a.208.208 0 0 1 .117-.367l4.772-.373z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqStar16 extends KbqSvgIcon {}
