import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightFromRectangle16]',
    template: `
        <svg:g>
            <svg:path
                d="m12.018 7.202-1.536-1.536a.2.2 0 0 1 0-.283l.848-.849a.2.2 0 0 1 .283 0l3.327 3.327a.2.2 0 0 1 0 .282l-3.327 3.327a.2.2 0 0 1-.283 0l-.848-.849a.2.2 0 0 1 0-.283l1.536-1.536H4.571a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2z"
            />
            <svg:path
                d="M9.002 6.002v-3.8a1.2 1.2 0 0 0-1.2-1.2h-5.6a1.2 1.2 0 0 0-1.2 1.2v11.6a1.2 1.2 0 0 0 1.2 1.2h5.6a1.2 1.2 0 0 0 1.2-1.2v-3.8h-1.6v3.2a.2.2 0 0 1-.2.2h-4.4a.2.2 0 0 1-.2-.2v-10.4c0-.11.09-.2.2-.2h4.4c.11 0 .2.09.2.2v3.2z"
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
export class KbqArrowRightFromRectangle16 extends KbqSvgIcon {}
