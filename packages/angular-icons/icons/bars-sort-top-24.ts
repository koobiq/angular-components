import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-sort-top-24,[kbqBarsSortTop24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.8 13.2a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h14.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM1.8 19.5a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h6.9a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM1.8 6.9a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsSortTop24 extends KbqSvgIcon {}
