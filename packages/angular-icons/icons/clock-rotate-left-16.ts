import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqClockRotateLeft16]',
    template: `
        <svg:g>
            <svg:path
                d="M9.1 8.9a.2.2 0 0 1-.2.2H5a.2.2 0 0 1-.2-.2V7.7c0-.11.09-.2.2-.2h2.5v-3c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2z"
            />
            <svg:path
                d="M5.136 12.579a5.4 5.4 0 1 0-1.718-7.441l1.136.709a.2.2 0 0 1-.019.35L.908 7.964a.2.2 0 0 1-.288-.18V3.75a.2.2 0 0 1 .305-.17l.33.208.806.503a7 7 0 1 1-.67 6.02.1.1 0 0 1 .049-.12l1.265-.631a.102.102 0 0 1 .142.06 5.38 5.38 0 0 0 2.29 2.96"
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
export class KbqClockRotateLeft16 extends KbqSvgIcon {}
