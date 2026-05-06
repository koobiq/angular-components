import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleRight16]',
    template: `
        <svg:g>
            <svg:path
                d="M6.78 8 2.058 3.191a.203.203 0 0 1 0-.284l.83-.846c.08-.081.21-.081.29 0L8.87 7.858a.203.203 0 0 1 0 .284L3.178 13.94c-.08.081-.21.081-.29 0l-.83-.845a.203.203 0 0 1 0-.285z"
            />
            <svg:path
                d="M12.352 8 7.63 3.191a.203.203 0 0 1 0-.284l.83-.846c.08-.081.21-.081.29 0l5.692 5.797a.203.203 0 0 1 0 .284L8.749 13.94c-.079.081-.21.081-.289 0l-.83-.845a.203.203 0 0 1 0-.285z"
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
export class KbqChevronDoubleRight16 extends KbqSvgIcon {}
