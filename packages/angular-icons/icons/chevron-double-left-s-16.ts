import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleLeftS16]',
    template: `
        <svg:g>
            <svg:path
                d="m9.969 8 3.722-3.81a.203.203 0 0 0 0-.284l-.83-.846a.2.2 0 0 0-.29 0L7.88 7.857a.203.203 0 0 0 0 .284l4.693 4.797c.079.081.209.081.288 0l.831-.845a.203.203 0 0 0 0-.285z"
            />
            <svg:path
                d="M4.399 8 8.12 4.19a.203.203 0 0 0 0-.284l-.83-.846a.2.2 0 0 0-.29 0L2.31 7.857a.203.203 0 0 0 0 .284l4.692 4.797c.08.081.21.081.29 0l.83-.845a.203.203 0 0 0 0-.285z"
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
export class KbqChevronDoubleLeftS16 extends KbqSvgIcon {}
