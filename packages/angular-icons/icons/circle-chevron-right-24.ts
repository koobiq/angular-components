import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-right-24,[kbqCircleChevronRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12 6.201 22.5 12 22.5 22.5 17.799 22.5 12m-12.286 5.674-.849-.848a.3.3 0 0 1 0-.425L13.767 12 9.365 7.599a.3.3 0 0 1 0-.425l.849-.848a.3.3 0 0 1 .424 0l4.826 4.826.02.022.616.616a.3.3 0 0 1 0 .424l-.848.849-.023.02-4.59 4.591a.3.3 0 0 1-.425 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronRight24 extends KbqSvgIcon {}
