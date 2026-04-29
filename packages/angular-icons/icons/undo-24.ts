import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-undo-24,[kbqUndo24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.094 11.049 10.046 15l-1.697 1.697L1.5 9.85 8.349 3l1.697 1.697L6.094 8.65h9.956c3.562 0 6.45 2.789 6.45 6.351s-2.888 6-6.45 6H12v-2.4h4.05c2.237 0 4.05-1.363 4.05-3.6s-1.813-3.951-4.05-3.951z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUndo24 extends KbqSvgIcon {}
