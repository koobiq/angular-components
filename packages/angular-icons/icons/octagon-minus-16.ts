import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-octagon-minus-16,[kbqOctagonMinus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11.35 1.058A.2.2 0 0 0 11.207 1l-6.455.016a.2.2 0 0 0-.141.059L1.058 4.65A.2.2 0 0 0 1 4.792l.016 6.455a.2.2 0 0 0 .06.141l3.575 3.553a.2.2 0 0 0 .141.059l6.455-.016a.2.2 0 0 0 .142-.06l3.553-3.575a.2.2 0 0 0 .058-.141l-.016-6.455a.2.2 0 0 0-.059-.142zM11.8 9H4.2a.2.2 0 0 1-.2-.2V7.2c0-.11.09-.2.2-.2h7.6c.11 0 .2.09.2.2v1.6a.2.2 0 0 1-.2.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqOctagonMinus16 extends KbqSvgIcon {}
