import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-redo-16,[kbqRedo16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11.937 7.366 9.303 10l1.131 1.131L15 6.566 10.434 2 9.303 3.131l2.634 2.635H5.3C2.925 5.766 1 7.626 1 10c0 2.375 1.925 4 4.3 4H8v-1.6H5.3c-1.491 0-2.7-.909-2.7-2.4s1.209-2.634 2.7-2.634z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRedo16 extends KbqSvgIcon {}
