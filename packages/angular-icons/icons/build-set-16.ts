import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-build-set-16,[kbqBuildSet16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.2 2.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2V2.4a.2.2 0 0 0-.2-.2zM11 9.21c0-.17.188-.27.324-.173l4.588 3.289a.214.214 0 0 1 0 .346l-4.588 3.288c-.136.098-.324-.002-.324-.172zM1 6.4c0-.11.09-.2.2-.2h13.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zm.2 3.8a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h8.6v-1.6z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBuildSet16 extends KbqSvgIcon {}
