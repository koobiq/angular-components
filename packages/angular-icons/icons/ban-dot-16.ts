import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ban-dot-16,[kbqBanDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.248 1.369c-.27.453-.43.978-.446 1.539A5.4 5.4 0 0 0 8 2.6a5.38 5.38 0 0 0-3.21 1.058l7.552 7.553A5.38 5.38 0 0 0 13.4 8c0-.632-.109-1.239-.308-1.802a3.2 3.2 0 0 0 1.54-.446C14.87 6.458 15 7.214 15 8a7 7 0 1 1-4.752-6.631m.963 10.973L3.658 4.79a5.4 5.4 0 0 0 7.553 7.553"
            />
            <g fill="currentColor">
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBanDot16 extends KbqSvgIcon {}
