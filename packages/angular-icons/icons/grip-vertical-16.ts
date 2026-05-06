import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGripVertical16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.8 1.2c0-.11.09-.2.2-.2h2.75c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM3.8 6.585c0-.11.09-.2.2-.2h2.75c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM3.8 11.97c0-.111.09-.2.2-.2h2.75c.11 0 .2.089.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM9.05 1.2c0-.11.09-.2.2-.2H12c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2zM9.05 6.585c0-.11.09-.2.2-.2H12c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2zM9.05 11.97c0-.111.09-.2.2-.2H12c.11 0 .2.089.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2z"
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
export class KbqGripVertical16 extends KbqSvgIcon {}
