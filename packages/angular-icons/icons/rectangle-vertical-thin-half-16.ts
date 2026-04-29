import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-vertical-thin-half-16,[kbqRectangleVerticalThinHalf16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M4 1.2A1.2 1.2 0 0 1 5.2 0h5.6A1.2 1.2 0 0 1 12 1.2v13.6a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 14.8zM5.8 8h4.4a.2.2 0 0 0 .2-.2v-6a.2.2 0 0 0-.2-.2H5.8a.2.2 0 0 0-.2.2v6c0 .11.09.2.2.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleVerticalThinHalf16 extends KbqSvgIcon {}
