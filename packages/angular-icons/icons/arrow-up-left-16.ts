import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-left-16,[kbqArrowUpLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.752 4.612h4.977c.112 0 .202-.09.202-.201V3.2A.2.2 0 0 0 10.729 3H3.2A.2.2 0 0 0 3 3.202v7.529c0 .111.09.201.201.201h1.21c.11 0 .201-.09.201-.201V5.752l7.639 7.639a.2.2 0 0 0 .284 0l.856-.855a.2.2 0 0 0 0-.285z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpLeft16 extends KbqSvgIcon {}
