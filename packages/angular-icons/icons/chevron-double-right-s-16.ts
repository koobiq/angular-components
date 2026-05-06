import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleRightS16]',
    template: `
        <svg:g>
            <svg:path
                d="M6.031 8 2.31 4.19a.203.203 0 0 1 0-.284l.83-.846c.08-.081.21-.081.29 0L8.12 7.857a.203.203 0 0 1 0 .284l-4.693 4.797c-.079.081-.209.081-.288 0l-.831-.845a.203.203 0 0 1 0-.285z"
            />
            <svg:path
                d="M11.601 8 7.88 4.19a.203.203 0 0 1 0-.284l.83-.846c.08-.081.21-.081.29 0l4.692 4.797a.203.203 0 0 1 0 .284l-4.692 4.797c-.08.081-.21.081-.29 0l-.83-.845a.203.203 0 0 1 0-.285z"
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
export class KbqChevronDoubleRightS16 extends KbqSvgIcon {}
