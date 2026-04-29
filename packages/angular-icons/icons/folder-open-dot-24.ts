import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-open-dot-24,[kbqFolderOpenDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="21" cy="6" r="3" fill="currentColor" />
            <g>
                <path
                    d="m5.318 21 4.188-9.422a.3.3 0 0 1 .274-.178h13.759a.3.3 0 0 1 .274.422l-3.598 8.108A1.8 1.8 0 0 1 18.57 21z"
                />
                <path
                    d="M16.2 6H12L9 3H3.3a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 3.3 21h.048L7.94 10.669A1.8 1.8 0 0 1 9.585 9.6h8.24A4.79 4.79 0 0 1 16.2 6"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderOpenDot24 extends KbqSvgIcon {}
