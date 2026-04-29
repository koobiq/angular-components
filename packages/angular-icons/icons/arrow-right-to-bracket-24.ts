import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-bracket-24,[kbqArrowRightToBracket24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M20.7 22.5h-6.9a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h6a.3.3 0 0 0 .3-.3V4.2a.3.3 0 0 0-.3-.3h-6a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3h6.9a1.8 1.8 0 0 1 1.8 1.8v17.4a1.8 1.8 0 0 1-1.8 1.8"
                />
                <path
                    d="m12.264 13.2-3.693 3.74a.3.3 0 0 0 0 .422l1.254 1.27a.3.3 0 0 0 .427 0l6.34-6.422a.3.3 0 0 0 0-.421l-6.34-6.422a.3.3 0 0 0-.427 0l-1.254 1.27a.3.3 0 0 0 0 .422l3.693 3.74H1.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToBracket24 extends KbqSvgIcon {}
