import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-triangle-vertical-thin-16,[kbqRectangleTriangleVerticalThin16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.2 0A1.2 1.2 0 0 0 4 1.2v13.6A1.2 1.2 0 0 0 5.2 16h5.6a1.2 1.2 0 0 0 1.2-1.2V1.2A1.2 1.2 0 0 0 10.8 0zm2.486 5.187c.123-.25.505-.25.628 0l2.454 4.955c.106.214-.062.458-.315.458H5.548c-.253 0-.42-.244-.315-.458z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleTriangleVerticalThin16 extends KbqSvgIcon {}
