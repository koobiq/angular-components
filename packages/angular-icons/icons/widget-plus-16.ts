import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWidgetPlus16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 4.158A3.156 3.156 0 0 1 4.154 1 3.156 3.156 0 0 1 7.31 4.158a3.156 3.156 0 0 1-3.155 3.158A3.156 3.156 0 0 1 1 4.158M8.691 4.158A3.156 3.156 0 0 1 11.846 1 3.156 3.156 0 0 1 15 4.158a3.156 3.156 0 0 1-3.154 3.158A3.156 3.156 0 0 1 8.69 4.158M1 11.842a3.156 3.156 0 0 1 3.154-3.158 3.156 3.156 0 0 1 3.155 3.158A3.156 3.156 0 0 1 4.154 15 3.156 3.156 0 0 1 1 11.842M11.03 11.042V8.884c0-.11.09-.2.2-.2h1.199c.11 0 .2.09.2.2v2.158h2.155c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H12.63V14.8a.2.2 0 0 1-.2.2h-1.198a.2.2 0 0 1-.2-.2v-2.158H8.876a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2z"
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
export class KbqWidgetPlus16 extends KbqSvgIcon {}
