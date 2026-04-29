import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-down-s-24,[kbqChevronDownS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 12.87 7.037 7.963a.3.3 0 0 0-.427 0L5.34 9.222a.31.31 0 0 0 0 .438l6.446 6.377a.3.3 0 0 0 .426 0L18.66 9.66a.31.31 0 0 0 0-.438L17.39 7.963a.3.3 0 0 0-.427 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDownS24 extends KbqSvgIcon {}
