import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-left-24,[kbqCircleChevronLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.5 12c0 5.799 4.701 10.5 10.5 10.5S22.5 17.799 22.5 12 17.799 1.5 12 1.5 1.5 6.201 1.5 12m12.286-5.674.848.848a.3.3 0 0 1 0 .425L10.234 12l4.4 4.401a.3.3 0 0 1 0 .425l-.848.848a.3.3 0 0 1-.424 0L8.536 12.85l-.02-.023-.616-.616a.3.3 0 0 1 0-.424l.848-.849.023-.02 4.59-4.591a.3.3 0 0 1 .425 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronLeft24 extends KbqSvgIcon {}
