import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bento-menu-24,[kbqBentoMenu24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 1.8a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 17.55a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM6.75 9.675a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM17.25 1.8a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM22.5 17.55a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM17.25 9.675a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM14.625 1.8a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM9.375 17.55a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM14.625 9.675a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBentoMenu24 extends KbqSvgIcon {}
