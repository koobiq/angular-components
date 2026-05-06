import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleDownS16]',
    template: `
        <svg:g>
            <svg:path
                d="m8 6.03 3.809-3.722a.203.203 0 0 1 .285 0l.845.83c.081.08.081.21 0 .29L8.142 8.12a.203.203 0 0 1-.284 0L3.06 3.428a.2.2 0 0 1 0-.29l.846-.83a.203.203 0 0 1 .284 0z"
            />
            <svg:path
                d="m8 11.6 3.809-3.722a.203.203 0 0 1 .285 0l.845.83c.081.08.081.21 0 .29L8.142 13.69a.203.203 0 0 1-.284 0L3.06 8.998a.2.2 0 0 1 0-.29l.846-.83a.203.203 0 0 1 .284 0z"
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
export class KbqChevronDoubleDownS16 extends KbqSvgIcon {}
