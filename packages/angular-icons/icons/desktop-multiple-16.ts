import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDesktopMultiple16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.8 1A1.2 1.2 0 0 1 15 2.2v5.6A1.2 1.2 0 0 1 13.8 9h-.399V3.803a1.2 1.2 0 0 0-1.2-1.2L8.1 2.6 3.999 2.6v-.4a1.2 1.2 0 0 1 1.2-1.2z"
            />
            <svg:path
                d="M12.2 5A1.2 1.2 0 0 0 11 3.8H2.2A1.2 1.2 0 0 0 1 5v5.6a1.2 1.2 0 0 0 1.2 1.2h3v1.6H2.8a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h7.5a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H7.9v-1.6H11a1.2 1.2 0 0 0 1.2-1.2z"
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
export class KbqDesktopMultiple16 extends KbqSvgIcon {}
