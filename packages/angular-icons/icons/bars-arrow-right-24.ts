import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-arrow-right-24,[kbqBarsArrowRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 18.9a.3.3 0 0 1 .3-.3h9.9a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM23.76 11.788a.3.3 0 0 1 0 .424l-6.424 6.424a.3.3 0 0 1-.424 0l-1.273-1.272a.3.3 0 0 1 0-.424l3.483-3.484a.15.15 0 0 0-.106-.256H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h17.216a.15.15 0 0 0 .106-.256L15.64 7.06a.3.3 0 0 1 0-.424l1.273-1.272a.3.3 0 0 1 .424 0zM1.5 3.3a.3.3 0 0 1 .3-.3h9.9a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsArrowRight24 extends KbqSvgIcon {}
