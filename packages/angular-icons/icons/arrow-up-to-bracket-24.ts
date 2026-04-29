import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-to-bracket-24,[kbqArrowUpToBracket24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 3.3v6.9a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-6a.3.3 0 0 1 .3-.3h15.6c-.584 0 .3.134.3.3v6a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V3.3c0-.994-1.556-1.8-1.8-1.8H3.3a1.8 1.8 0 0 0-1.8 1.8"
                />
                <path
                    d="m10.8 11.736-3.74 3.693a.3.3 0 0 1-.422 0l-1.27-1.254a.3.3 0 0 1 0-.427l6.422-6.34a.3.3 0 0 1 .421 0l6.422 6.34a.3.3 0 0 1 0 .427l-1.27 1.254a.3.3 0 0 1-.422 0l-3.74-3.693V22.2a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpToBracket24 extends KbqSvgIcon {}
