import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsArrowLeft16]',
    template: `
        <svg:g>
            <svg:path
                d="M15 12.6a.2.2 0 0 0-.2-.2H8.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.6a.2.2 0 0 0 .2-.2zM.16 7.859a.2.2 0 0 0 0 .282l4.283 4.283a.2.2 0 0 0 .282 0l.85-.848a.2.2 0 0 0 0-.283L3.251 8.971a.1.1 0 0 1 .07-.171H14.8a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2H3.323a.1.1 0 0 1-.071-.17l2.322-2.323a.2.2 0 0 0 0-.283l-.849-.848a.2.2 0 0 0-.282 0zM15 2.2a.2.2 0 0 0-.2-.2H8.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.6a.2.2 0 0 0 .2-.2z"
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
export class KbqBarsArrowLeft16 extends KbqSvgIcon {}
