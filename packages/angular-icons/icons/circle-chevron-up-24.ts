import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-up-24,[kbqCircleChevronUp24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5m5.674 12.286-.848.848a.3.3 0 0 1-.425 0L12 10.234l-4.401 4.4a.3.3 0 0 1-.425 0l-.848-.848a.3.3 0 0 1 0-.424l4.826-4.826.022-.02.616-.616a.3.3 0 0 1 .424 0l.849.848.02.023 4.591 4.59a.3.3 0 0 1 0 .425"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronUp24 extends KbqSvgIcon {}
