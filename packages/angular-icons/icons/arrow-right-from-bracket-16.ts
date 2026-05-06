import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightFromBracket16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.207 15h4.627a.2.2 0 0 0 .201-.2v-1.2a.2.2 0 0 0-.201-.2H2.81a.2.2 0 0 1-.202-.2V2.8c0-.11.09-.2.201-.2h4.024a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2H2.207C1.54 1 1 1.537 1 2.2v11.6c0 .663.54 1.2 1.207 1.2"
            />
            <svg:path
                d="M12.04 7.2 9.564 4.706a.2.2 0 0 1 0-.281l.84-.847a.2.2 0 0 1 .287 0l4.251 4.281a.2.2 0 0 1 0 .281l-4.251 4.281a.2.2 0 0 1-.287 0l-.84-.846a.2.2 0 0 1 0-.281L12.04 8.8H5.023a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2z"
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
export class KbqArrowRightFromBracket16 extends KbqSvgIcon {}
