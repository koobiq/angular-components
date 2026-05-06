import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleUpS16]',
    template: `
        <svg:g>
            <svg:path
                d="m8 9.968 3.809 3.722a.203.203 0 0 0 .285 0l.845-.83c.081-.08.081-.21 0-.29L8.142 7.879a.203.203 0 0 0-.284 0L3.06 12.571c-.081.079-.081.21 0 .289l.846.83a.203.203 0 0 0 .284 0z"
            />
            <svg:path
                d="m8 4.398 3.809 3.722a.203.203 0 0 0 .285 0l.845-.83c.081-.08.081-.21 0-.29L8.142 2.309a.203.203 0 0 0-.284 0L3.06 7.001c-.081.079-.081.21 0 .289l.846.83a.203.203 0 0 0 .284 0z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqChevronDoubleUpS16 extends KbqSvgIcon {}
