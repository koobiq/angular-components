import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDownS16]',
    template: `
        <svg:path
            d="m8 8.85 3.809-3.722a.203.203 0 0 1 .285 0l.845.83c.081.08.081.21 0 .29L8.142 10.94a.203.203 0 0 1-.284 0L3.06 6.248a.2.2 0 0 1 0-.29l.846-.83a.203.203 0 0 1 .284 0z"
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
export class KbqChevronDownS16 extends KbqSvgIcon {}
