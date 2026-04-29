import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-left-16,[kbqCircleChevronLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m8.19-3.783.566.566a.2.2 0 0 1 0 .283L6.822 8l2.934 2.934a.2.2 0 0 1 0 .283l-.565.566a.2.2 0 0 1-.283 0L5.69 8.566l-.014-.016-.41-.41a.2.2 0 0 1 0-.283l.565-.566.015-.013 3.06-3.06a.2.2 0 0 1 .284 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronLeft16 extends KbqSvgIcon {}
