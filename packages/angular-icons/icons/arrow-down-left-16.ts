import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-down-left-16,[kbqArrowDownLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.753 11.388h4.978c.111 0 .201.09.201.201v1.21c0 .11-.09.201-.201.201H3.2A.2.2 0 0 1 3 12.798V5.27c0-.111.09-.201.202-.201H4.41c.111 0 .201.09.201.201v4.979l7.639-7.639a.2.2 0 0 1 .285 0l.855.855a.2.2 0 0 1 0 .285z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowDownLeft16 extends KbqSvgIcon {}
