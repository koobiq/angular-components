import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqServer16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 10A1.2 1.2 0 0 1 1 8.8V7.2A1.2 1.2 0 0 1 2.2 6h11.6A1.2 1.2 0 0 1 15 7.2v1.6a1.2 1.2 0 0 1-1.2 1.2zm2.3-2a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 .4c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H7.7a.2.2 0 0 0-.2.2zM2.2 15A1.2 1.2 0 0 1 1 13.8v-1.6A1.2 1.2 0 0 1 2.2 11h11.6a1.2 1.2 0 0 1 1.2 1.2v1.6a1.2 1.2 0 0 1-1.2 1.2zm2.3-2a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 .4c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H7.7a.2.2 0 0 0-.2.2zM2.2 5A1.2 1.2 0 0 1 1 3.8V2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v1.6A1.2 1.2 0 0 1 13.8 5zm2.3-2a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 .4c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H7.7a.2.2 0 0 0-.2.2z"
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
export class KbqServer16 extends KbqSvgIcon {}
