import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReplace24]',
    template: `
        <svg:g>
            <svg:path
                d="M4.05 9.759a8.265 8.265 0 0 1 16.017-2.874h2.238a.3.3 0 0 1 .252.457l-3.555 5.718a.297.297 0 0 1-.504 0l-3.555-5.718a.3.3 0 0 1 .252-.457h2.234A5.865 5.865 0 0 0 6.45 9.759V13.2h-2.4zM1.7 15a.2.2 0 0 0-.2.2v7.1c0 .11.09.2.2.2h7.1a.2.2 0 0 0 .2-.2v-7.1a.2.2 0 0 0-.2-.2zM15.2 15a.2.2 0 0 0-.2.2v7.1c0 .11.09.2.2.2h7.1a.2.2 0 0 0 .2-.2v-7.1a.2.2 0 0 0-.2-.2z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqReplace24 extends KbqSvgIcon {}
