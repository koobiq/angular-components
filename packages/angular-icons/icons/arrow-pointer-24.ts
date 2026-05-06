import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowPointer24]',
    template: `
        <svg:g>
            <svg:path
                d="m5.458 20.213 3.519-3.519a.3.3 0 0 0 0-.426L7.76 15.05a.3.3 0 0 0-.427 0l-3.522 3.522c.487.605 1.04 1.156 1.647 1.64M18.573 3.811c.605.487 1.156 1.04 1.64 1.647l-3.519 3.519a.3.3 0 0 1-.426 0L15.05 7.76a.3.3 0 0 1 0-.427zM13.176 1.565v4.992a.3.3 0 0 1-.302.301h-1.72a.3.3 0 0 1-.303-.301V1.562a10.6 10.6 0 0 1 2.325.003M1.562 10.852h4.995c.166 0 .301.134.301.301v1.721a.3.3 0 0 1-.301.302H1.565a10.6 10.6 0 0 1-.003-2.325M3.799 5.442A10.6 10.6 0 0 1 5.443 3.8l3.534 3.534a.3.3 0 0 1 0 .427L7.76 8.977a.3.3 0 0 1-.427 0zM13.744 22.505c.053.231.34.314.507.147l2.154-2.143 3.403 3.403a.3.3 0 0 0 .426 0l3.68-3.68a.3.3 0 0 0 0-.427l-3.392-3.392 2.078-2.067a.302.302 0 0 0-.144-.508l-10.82-2.526a.302.302 0 0 0-.362.361z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 25 24',
        width: '25',
        height: '24'
    }
})
export class KbqArrowPointer24 extends KbqSvgIcon {}
