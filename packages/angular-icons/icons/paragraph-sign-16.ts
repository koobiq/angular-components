import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-paragraph-sign-16,[kbqParagraphSign16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.75 1.5a3.75 3.75 0 0 0 0 7.5H5v5.3c0 .11.09.2.2.2h1.788a.2.2 0 0 0 .2-.2V3.258h3.124V14.3c0 .11.09.2.2.2H12.3a.2.2 0 0 0 .2-.2V3.258h3.3a.2.2 0 0 0 .2-.2V1.7a.2.2 0 0 0-.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqParagraphSign16 extends KbqSvgIcon {}
