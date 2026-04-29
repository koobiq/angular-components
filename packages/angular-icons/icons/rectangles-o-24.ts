import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangles-o-24,[kbqRectanglesO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 15.3v5.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8v-5.4a1.8 1.8 0 0 0-1.8-1.8H3.3a1.8 1.8 0 0 0-1.8 1.8m18.6.6v4.2H3.9v-4.2zM1.5 8.7a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8H3.3a1.8 1.8 0 0 0-1.8 1.8zm2.4-4.8h16.2v4.2H3.9z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectanglesO24 extends KbqSvgIcon {}
