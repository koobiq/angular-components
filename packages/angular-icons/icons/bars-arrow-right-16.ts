import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsArrowRight16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 12.6c0-.11.09-.2.2-.2h6.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM15.84 7.859a.2.2 0 0 1 0 .282l-4.283 4.283a.2.2 0 0 1-.282 0l-.85-.848a.2.2 0 0 1 0-.283l2.323-2.322a.1.1 0 0 0-.07-.171H1.2a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h11.478a.1.1 0 0 0 .07-.17l-2.322-2.323a.2.2 0 0 1 0-.283l.849-.848a.2.2 0 0 1 .282 0zM1 2.2c0-.11.09-.2.2-.2h6.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2z"
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
export class KbqBarsArrowRight16 extends KbqSvgIcon {}
