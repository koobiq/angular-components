import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleLeft16]',
    template: `
        <svg:g>
            <svg:path
                d="m9.22 8 4.722 4.809a.203.203 0 0 1 0 .285l-.83.845c-.08.081-.21.081-.29 0L7.13 8.142a.203.203 0 0 1 0-.284l5.692-5.797c.08-.081.21-.081.29 0l.83.846a.203.203 0 0 1 0 .284z"
            />
            <svg:path
                d="m3.648 8 4.722 4.809a.203.203 0 0 1 0 .285l-.83.845c-.08.081-.21.081-.29 0L1.559 8.142a.203.203 0 0 1 0-.284L7.251 2.06c.079-.081.21-.081.289 0l.83.846a.203.203 0 0 1 0 .284z"
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
export class KbqChevronDoubleLeft16 extends KbqSvgIcon {}
