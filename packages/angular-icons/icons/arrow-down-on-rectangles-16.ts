import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownOnRectangles16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.6 2.6v2.8h3.2V7H2.2A1.2 1.2 0 0 1 1 5.8V2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v3.6A1.2 1.2 0 0 1 13.8 7h-3.6V5.4h3.2V2.6z"
            />
            <svg:path
                d="M7 4.9c0-.11.09-.2.2-.2h1.6c.11 0 .2.09.2.2v3h1.343a.2.2 0 0 1 .17.305L8.17 12.022a.2.2 0 0 1-.34 0L5.487 8.205a.2.2 0 0 1 .17-.305H7z"
            />
            <svg:path
                d="M2.6 10.6h2.949L4.567 9H2.2A1.2 1.2 0 0 0 1 10.2v3.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2v-3.6A1.2 1.2 0 0 0 13.8 9h-2.367l-.982 1.6H13.4v2.8H2.6z"
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
export class KbqArrowDownOnRectangles16 extends KbqSvgIcon {}
