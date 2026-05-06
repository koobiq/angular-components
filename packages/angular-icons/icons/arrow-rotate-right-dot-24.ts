import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRotateRightDot24]',
    template: `
        <svg:g>
            <svg:path
                d="M19.638 9.571a4.8 4.8 0 0 0 1.935-1.31c2.13 4.715.499 10.397-4.011 13.215-4.918 3.073-11.396 1.577-14.469-3.34C.02 13.218 1.516 6.74 6.433 3.665l.01-.006-.76-1.218-.31-.495a.3.3 0 0 1 .254-.46l6.054.001a.3.3 0 0 1 .27.432L9.297 7.36a.3.3 0 0 1-.524.028L7.715 5.696l-.01.006a8.1 8.1 0 1 0 11.832 3.905z"
            />
            <svg:path d="M19.022 7.88a3 3 0 0 0 1.745-1.671 3 3 0 1 0-1.745 1.671" />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqArrowRotateRightDot24 extends KbqSvgIcon {}
