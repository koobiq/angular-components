import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderOpenBadgeMagnifyingGlass16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h.032l3.061-6.887A1.2 1.2 0 0 1 6.39 6.4H15V5.2A1.2 1.2 0 0 0 13.8 4H8L6 2z"
            />
            <svg:path
                d="M13.29 14.14a2.765 2.765 0 0 1-4.245-2.335 2.765 2.765 0 1 1 5.097 1.482l1.8 1.8a.2.2 0 0 1 0 .285l-.57.569a.2.2 0 0 1-.284 0zm.076-2.335a1.558 1.558 0 1 0-3.117-.002 1.558 1.558 0 0 0 3.117.002"
            />
            <svg:path
                d="m3.546 14 2.791-6.282A.2.2 0 0 1 6.52 7.6h9.172a.2.2 0 0 1 .183.28l-.766 1.728A3.965 3.965 0 0 0 8.507 14z"
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
export class KbqFolderOpenBadgeMagnifyingGlass16 extends KbqSvgIcon {}
