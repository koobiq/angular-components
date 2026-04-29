import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-undo-16,[kbqUndo16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M4.063 7.366 6.697 10l-1.131 1.131L1 6.566 5.566 2l1.131 1.131-2.634 2.635H10.7c2.375 0 4.3 1.86 4.3 4.234 0 2.375-1.925 4-4.3 4H8v-1.6h2.7c1.491 0 2.7-.909 2.7-2.4s-1.209-2.634-2.7-2.634z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUndo16 extends KbqSvgIcon {}
