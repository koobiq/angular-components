import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronUp16]',
    template: `
        <svg:path
            d="m8 6.67-4.809 4.771a.2.2 0 0 1-.284 0l-.846-.839a.206.206 0 0 1 0-.292L7.858 4.56a.2.2 0 0 1 .284 0l5.797 5.751c.081.08.081.212 0 .292l-.845.84a.2.2 0 0 1-.285 0z"
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
export class KbqChevronUp16 extends KbqSvgIcon {}
