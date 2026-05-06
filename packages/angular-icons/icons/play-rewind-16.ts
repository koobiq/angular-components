import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlayRewind16]',
    template: `
        <svg:g>
            <svg:path
                d="m14.755 3.783.33-.207a.2.2 0 0 1 .306.17v4.036a.2.2 0 0 1-.288.18l-3.628-1.77a.2.2 0 0 1-.018-.35l1.124-.701A5.4 5.4 0 0 0 2.84 6.408a.102.102 0 0 1-.142.063l-1.192-.582a.196.196 0 0 1-.1-.241 7.001 7.001 0 0 1 12.532-1.355zM1.246 12.211l-.33.207a.2.2 0 0 1-.306-.17V8.212a.2.2 0 0 1 .288-.18l3.628 1.77a.2.2 0 0 1 .019.349l-1.128.704a5.4 5.4 0 0 0 9.743-1.264.102.102 0 0 1 .142-.063l1.191.582c.09.043.134.147.1.241A7.001 7.001 0 0 1 2.06 11.703z"
            />
            <svg:path
                d="M6.76 5.23c-.11-.078-.26.002-.26.14v5.26c0 .137.15.217.26.14l3.67-2.632a.17.17 0 0 0 0-.276z"
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
export class KbqPlayRewind16 extends KbqSvgIcon {}
