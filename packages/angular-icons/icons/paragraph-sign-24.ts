import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-paragraph-sign-24,[kbqParagraphSign24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.625 2.25a5.625 5.625 0 0 0 0 11.25H7.5v7.95a.3.3 0 0 0 .3.3h2.683a.3.3 0 0 0 .3-.3V4.887h4.684V21.45a.3.3 0 0 0 .3.3h2.683a.3.3 0 0 0 .3-.3V4.887h4.95a.3.3 0 0 0 .3-.3V2.55a.3.3 0 0 0-.3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqParagraphSign24 extends KbqSvgIcon {}
