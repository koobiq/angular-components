import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextUnderline16]',
    template: `
        <svg:g>
            <svg:path
                d="M10.9 1.5a.2.2 0 0 0-.2.2v6.76q0 .996-.331 1.641-.331.636-.938.94-.599.302-1.426.303-.827 0-1.436-.304a2.1 2.1 0 0 1-.938-.939q-.33-.645-.331-1.64V1.7a.2.2 0 0 0-.2-.2H3.2a.2.2 0 0 0-.2.2v6.76q0 1.575.644 2.637A4.15 4.15 0 0 0 5.429 12.7q1.131.531 2.576.531 1.398 0 2.53-.531a4.2 4.2 0 0 0 1.803-1.603Q13 10.035 13 8.46V1.7a.2.2 0 0 0-.2-.2zM2.2 14.4a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h11.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2z"
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
export class KbqTextUnderline16 extends KbqSvgIcon {}
