import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsSortBottom16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.2 7.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h9.6a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2zM1.2 3a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h4.6a.2.2 0 0 0 .2-.2V3.2a.2.2 0 0 0-.2-.2zM1.2 11.4a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2z"
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
export class KbqBarsSortBottom16 extends KbqSvgIcon {}
