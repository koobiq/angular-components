import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-horizontal-24,[kbqBarsHorizontal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 3.3a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v3.15a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 17.55a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v3.15a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM22.5 10.425a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsHorizontal24 extends KbqSvgIcon {}
