import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderMultiple16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 5A1.2 1.2 0 0 0 1 6.2v.6h5.8L5 5zM1 8v5.8A1.2 1.2 0 0 0 2.2 15h9.6a1.2 1.2 0 0 0 1.2-1.2V9.2A1.2 1.2 0 0 0 11.8 8zM3 2.2A1.2 1.2 0 0 1 4.2 1H7l1.8 1.8H3z"
            />
            <svg:path
                d="M5.697 4H13.8A1.2 1.2 0 0 1 15 5.2v4.6a1.2 1.2 0 0 1-.8 1.132V9.2a2.4 2.4 0 0 0-2.4-2.4H8.497z"
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
export class KbqFolderMultiple16 extends KbqSvgIcon {}
