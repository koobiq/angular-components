import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-horizontal-o-24,[kbqFileHorizontalO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M24 9.124a.3.3 0 0 0-.088-.212l-5.824-5.824A.3.3 0 0 0 17.876 3H1.8A1.8 1.8 0 0 0 0 4.8v14.4A1.8 1.8 0 0 0 1.8 21h20.4a1.8 1.8 0 0 0 1.8-1.8zM21.6 10.5v7.8a.3.3 0 0 1-.3.3H2.7a.3.3 0 0 1-.3-.3V5.7a.3.3 0 0 1 .3-.3h13.8v4.8a.3.3 0 0 0 .3.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileHorizontalO24 extends KbqSvgIcon {}
