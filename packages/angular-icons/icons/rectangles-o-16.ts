import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangles-o-16,[kbqRectanglesO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 10.2v3.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2v-3.6A1.2 1.2 0 0 0 13.8 9H2.2A1.2 1.2 0 0 0 1 10.2m12.4.4v2.8H2.6v-2.8zM1 5.8A1.2 1.2 0 0 0 2.2 7h11.6A1.2 1.2 0 0 0 15 5.8V2.2A1.2 1.2 0 0 0 13.8 1H2.2A1.2 1.2 0 0 0 1 2.2zm1.6-3.2h10.8v2.8H2.6z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectanglesO16 extends KbqSvgIcon {}
