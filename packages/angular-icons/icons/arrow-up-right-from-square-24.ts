import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-right-from-square-24,[kbqArrowUpRightFromSquare24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M7.2 6.9a.3.3 0 0 0 .3-.3V4.8a.3.3 0 0 0-.3-.3H3.3a.3.3 0 0 0-.3.3v15.9a.3.3 0 0 0 .3.3h15.9a.3.3 0 0 0 .3-.3v-4.112a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3V18.3a.3.3 0 0 1-.3.3H5.7a.3.3 0 0 1-.3-.3V7.2a.3.3 0 0 1 .3-.3z"
                />
                <path
                    d="M22.5 10.44a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V5.607L9.895 15.81a.3.3 0 0 1-.424 0l-1.273-1.273a.3.3 0 0 1 0-.424L18.412 3.9h-4.844a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpRightFromSquare24 extends KbqSvgIcon {}
