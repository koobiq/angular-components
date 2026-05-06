import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleArrowRightDotO16]',
    template: `
        <svg:g fill="currentColor">
            <svg:path d="M11.093 2.396A2.01 2.01 0 0 1 13 1a2 2 0 1 1-1.907 1.396" />
            <svg:path d="M11.093 2.396A2.01 2.01 0 0 1 13 1a2 2 0 1 1-1.907 1.396" />
        </svg:g>
        <svg:path
            d="M10.247 1.368a3.2 3.2 0 0 0-.446 1.54A5.401 5.401 0 0 0 2.66 7.195l6.37.003-2.07-2.071a.2.2 0 0 1 0-.283l.8-.8a.2.2 0 0 1 .283 0l3.814 3.813a.2.2 0 0 1 0 .283l-3.814 3.814a.2.2 0 0 1-.282 0l-.801-.8a.2.2 0 0 1 0-.284l2.064-2.064-6.364-.002a5.401 5.401 0 1 0 10.433-2.605 3.2 3.2 0 0 0 1.54-.446 7 7 0 1 1-4.385-4.385"
        />
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
export class KbqCircleArrowRightDotO16 extends KbqSvgIcon {}
