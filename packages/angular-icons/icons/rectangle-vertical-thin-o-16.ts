import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-vertical-thin-o-16,[kbqRectangleVerticalThinO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.6 1.8c0-.11.09-.2.2-.2h4.4c.11 0 .2.09.2.2v12.4a.2.2 0 0 1-.2.2H5.8a.2.2 0 0 1-.2-.2zM5.2 0A1.2 1.2 0 0 0 4 1.2v13.6A1.2 1.2 0 0 0 5.2 16h5.6a1.2 1.2 0 0 0 1.2-1.2V1.2A1.2 1.2 0 0 0 10.8 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleVerticalThinO16 extends KbqSvgIcon {}
