import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hourglass-end-16,[kbqHourglassEnd16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4.995 12.8c0 .11.09.2.2.2H10.8a.2.2 0 0 0 .2-.2v-1.236a.2.2 0 0 0-.059-.141L8.145 8.64a.2.2 0 0 0-.281 0l-2.81 2.782a.2.2 0 0 0-.059.143z"
                />
                <path
                    d="M2 1.2v4.217a.2.2 0 0 0 .059.142L4.5 8l-2.441 2.441a.2.2 0 0 0-.059.142V14.8A1.2 1.2 0 0 0 3.2 16h9.6a1.2 1.2 0 0 0 1.2-1.2v-4.217a.2.2 0 0 0-.059-.142L11.5 8l2.441-2.441A.2.2 0 0 0 14 5.417V1.2A1.2 1.2 0 0 0 12.8 0H3.2A1.2 1.2 0 0 0 2 1.2m4.621 6.941a.2.2 0 0 0 0-.282L3.6 4.837V1.6h8.8v3.237L9.379 7.86a.2.2 0 0 0 0 .282l3.021 3.022V14.4H3.6v-3.237z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHourglassEnd16 extends KbqSvgIcon {}
