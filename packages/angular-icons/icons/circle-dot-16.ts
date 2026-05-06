import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleDot16]',
    template: `
        <svg:path d="M10.247 1.368a7 7 0 1 0 4.385 4.385 3.2 3.2 0 0 1-4.385-4.385" />
        <svg:g fill="currentColor">
            <svg:path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            <svg:path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
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
export class KbqCircleDot16 extends KbqSvgIcon {}
