import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-badge-plus-24,[kbqFolderBadgePlus24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 4.8A1.8 1.8 0 0 1 3.3 3h4.2l2.7 2.7H1.5zM1.5 7.5h19.2a1.8 1.8 0 0 1 1.8 1.8v6.75h-1.05V12a.3.3 0 0 0-.3-.3h-4.8a.3.3 0 0 0-.3.3v4.05H12a.3.3 0 0 0-.3.3V21H3.3a1.8 1.8 0 0 1-1.8-1.8z"
                />
                <path
                    d="M24 19.35a.3.3 0 0 1-.3.3h-4.05v4.05a.3.3 0 0 1-.3.3h-1.2a.3.3 0 0 1-.3-.3v-4.05H13.8a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h4.05V13.8a.3.3 0 0 1 .3-.3h1.2a.3.3 0 0 1 .3.3v4.05h4.05a.3.3 0 0 1 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderBadgePlus24 extends KbqSvgIcon {}
