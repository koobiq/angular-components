import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-minus-16,[kbqMinus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M14 8.6V7.4a.2.2 0 0 0-.2-.2H2.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h11.6a.2.2 0 0 0 .2-.2" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMinus16 extends KbqSvgIcon {}
