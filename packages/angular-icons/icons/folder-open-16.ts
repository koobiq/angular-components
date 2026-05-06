import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderOpen16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h.032l3.061-6.887A1.2 1.2 0 0 1 6.39 6.4H15V5.2A1.2 1.2 0 0 0 13.8 4H8L6 2z"
            />
            <svg:path
                d="m3.546 14 2.791-6.281A.2.2 0 0 1 6.52 7.6h9.172a.2.2 0 0 1 .183.281l-2.399 5.406A1.2 1.2 0 0 1 12.38 14z"
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
export class KbqFolderOpen16 extends KbqSvgIcon {}
