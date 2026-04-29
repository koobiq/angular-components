import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-expand-diagonal-24,[kbqArrowsExpandDiagonal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M18.503 3.798H14.11a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3h8.09a.3.3 0 0 1 .3.3v8.09a.3.3 0 0 1-.3.3h-1.698a.3.3 0 0 1-.3-.3V5.512l-5.327 5.32a.3.3 0 0 1-.425 0l-1.28-1.283a.3.3 0 0 1 0-.425zM3.798 18.488l5.327-5.32a.3.3 0 0 1 .425 0l1.28 1.283a.3.3 0 0 1 0 .425l-5.333 5.326H9.89a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-8.09a.3.3 0 0 1 .3-.3h1.698a.3.3 0 0 1 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsExpandDiagonal24 extends KbqSvgIcon {}
