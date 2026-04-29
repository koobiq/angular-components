import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-dot-16,[kbqFolderDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="14" cy="4" r="2" fill="currentColor" />
            <g>
                <path
                    d="M10.96 5H1v7.8A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V7.04q-.474.158-1 .16A3.2 3.2 0 0 1 10.96 5M1 3.2A1.2 1.2 0 0 1 2.2 2H5l1.8 1.8H1z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderDot16 extends KbqSvgIcon {}
