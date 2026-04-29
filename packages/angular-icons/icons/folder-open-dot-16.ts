import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-open-dot-16,[kbqFolderOpenDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="14" cy="4" r="2" fill="currentColor" />
            <g>
                <path
                    d="m3.546 14 2.791-6.281A.2.2 0 0 1 6.52 7.6h9.172a.2.2 0 0 1 .183.281l-2.399 5.406A1.2 1.2 0 0 1 12.38 14z"
                />
                <path
                    d="M10.8 4H8L6 2H2.2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h.032l3.061-6.887A1.2 1.2 0 0 1 6.39 6.4h5.493A3.2 3.2 0 0 1 10.8 4"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderOpenDot16 extends KbqSvgIcon {}
