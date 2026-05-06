import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHourglassHalf16]',
    template: `
        <svg:g>
            <svg:path
                d="M5 3.2c0-.11.09-.2.2-.2h5.605c.11 0 .2.09.2.2v1.235a.2.2 0 0 1-.06.142L8.137 7.36a.2.2 0 0 1-.281 0L5.059 4.577A.2.2 0 0 1 5 4.436zM7.552 8.7c0-.11.09-.2.2-.2h.49c.111 0 .2.09.2.2v.49a.2.2 0 0 1-.2.2h-.49a.2.2 0 0 1-.2-.2zM8.443 10.497a.2.2 0 0 0-.2-.2h-.49a.2.2 0 0 0-.2.2v.49c0 .11.089.2.2.2h.49a.2.2 0 0 0 .2-.2z"
            />
            <svg:path
                d="M13.941 10.441a.2.2 0 0 1 .059.142V14.8a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8v-4.217a.2.2 0 0 1 .059-.142L4.5 8 2.059 5.559A.2.2 0 0 1 2 5.417V1.2A1.2 1.2 0 0 1 3.2 0h9.6A1.2 1.2 0 0 1 14 1.2v4.217a.2.2 0 0 1-.059.142L11.5 8zm-4.562-2.3a.2.2 0 0 1 0-.282L12.4 4.837V1.6H3.6v3.237L6.621 7.86a.2.2 0 0 1 0 .282L3.6 11.163V14.4h2.055l2.214-2.17a.2.2 0 0 1 .28.001l2.204 2.169H12.4v-3.237z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqHourglassHalf16 extends KbqSvgIcon {}
