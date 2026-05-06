import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronLeftS16]',
    template: `
        <svg:path
            d="m7.148 8 3.722 3.809a.203.203 0 0 1 0 .285l-.83.845c-.08.081-.21.081-.29 0L5.059 8.142a.203.203 0 0 1 0-.284L9.751 3.06c.079-.081.21-.081.289 0l.83.846a.203.203 0 0 1 0 .284z"
        />
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
export class KbqChevronLeftS16 extends KbqSvgIcon {}
