import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBentoMenu24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 1.8a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 17.55a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM6.75 9.675a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM17.25 1.8a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM22.5 17.55a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM17.25 9.675a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM14.625 1.8a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3zM9.375 17.55a.3.3 0 0 1 .3-.3h4.65a.3.3 0 0 1 .3.3v4.65a.3.3 0 0 1-.3.3h-4.65a.3.3 0 0 1-.3-.3zM14.625 9.675a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3v4.65a.3.3 0 0 0 .3.3h4.65a.3.3 0 0 0 .3-.3z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqBentoMenu24 extends KbqSvgIcon {}
