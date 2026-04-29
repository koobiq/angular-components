import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-down-on-rectangles-24,[kbqArrowDownOnRectangles24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.9 3.9v4.2h4.8v2.4H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v5.4a1.8 1.8 0 0 1-1.8 1.8h-5.4V8.1h4.8V3.9z"
                />
                <path
                    d="M10.5 7.35a.3.3 0 0 1 .3-.3h2.4a.3.3 0 0 1 .3.3v4.5h2.014a.3.3 0 0 1 .256.457l-3.514 5.726a.3.3 0 0 1-.512 0L8.23 12.307a.3.3 0 0 1 .256-.457H10.5z"
                />
                <path
                    d="M3.9 15.9h4.423l-1.472-2.4H3.3a1.8 1.8 0 0 0-1.8 1.8v5.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8v-5.4a1.8 1.8 0 0 0-1.8-1.8h-3.55l-1.473 2.4H20.1v4.2H3.9z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowDownOnRectangles24 extends KbqSvgIcon {}
