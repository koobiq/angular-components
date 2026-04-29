import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-vertical-thin-o-24,[kbqRectangleVerticalThinO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.4 2.7a.3.3 0 0 1 .3-.3h6.6a.3.3 0 0 1 .3.3v18.6a.3.3 0 0 1-.3.3H8.7a.3.3 0 0 1-.3-.3zM7.8 0A1.8 1.8 0 0 0 6 1.8v20.4A1.8 1.8 0 0 0 7.8 24h8.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 16.2 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleVerticalThinO24 extends KbqSvgIcon {}
