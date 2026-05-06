import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightS16]',
    template: `
        <svg:path
            d="M11.053 7.214 8.559 4.69a.2.2 0 0 1 0-.284l.839-.846c.08-.081.212-.081.292 0l4.251 4.297a.2.2 0 0 1 0 .284L9.69 12.44a.206.206 0 0 1-.292 0l-.84-.845a.2.2 0 0 1 0-.285l2.462-2.49H2.201a.2.2 0 0 1-.201-.2V7.414c0-.11.09-.2.201-.2z"
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
export class KbqArrowRightS16 extends KbqSvgIcon {}
