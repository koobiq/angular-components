import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-up-16,[kbqCircleChevronUp16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1m3.783 8.19-.566.566a.2.2 0 0 1-.283 0L8 6.822 5.066 9.756a.2.2 0 0 1-.283 0l-.566-.565a.2.2 0 0 1 0-.283L7.434 5.69l.016-.014.41-.41a.2.2 0 0 1 .283 0l.566.565.013.015 3.06 3.06a.2.2 0 0 1 0 .284"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronUp16 extends KbqSvgIcon {}
