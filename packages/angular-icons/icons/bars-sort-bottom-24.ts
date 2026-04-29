import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-sort-bottom-24,[kbqBarsSortBottom24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.8 10.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3zM1.8 4.5a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h6.9a.3.3 0 0 0 .3-.3V4.8a.3.3 0 0 0-.3-.3zM1.8 17.1a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsSortBottom24 extends KbqSvgIcon {}
