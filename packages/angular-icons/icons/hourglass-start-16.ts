import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hourglass-start-16,[kbqHourglassStart16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.005 3.2a.2.2 0 0 0-.2-.2H5.2a.2.2 0 0 0-.2.2v1.236a.2.2 0 0 0 .059.141L7.855 7.36a.2.2 0 0 0 .281 0l2.81-2.783a.2.2 0 0 0 .059-.142z"
                />
                <path
                    d="M14 14.8v-4.217a.2.2 0 0 0-.059-.142L11.5 8l2.441-2.441A.2.2 0 0 0 14 5.417V1.2A1.2 1.2 0 0 0 12.8 0H3.2A1.2 1.2 0 0 0 2 1.2v4.217a.2.2 0 0 0 .059.142L4.5 8l-2.441 2.441a.2.2 0 0 0-.059.142V14.8A1.2 1.2 0 0 0 3.2 16h9.6a1.2 1.2 0 0 0 1.2-1.2M9.379 7.859a.2.2 0 0 0 0 .282l3.021 3.022V14.4H3.6v-3.237L6.621 8.14a.2.2 0 0 0 0-.282L3.6 4.837V1.6h8.8v3.237z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHourglassStart16 extends KbqSvgIcon {}
