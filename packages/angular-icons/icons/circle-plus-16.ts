import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCirclePlus16]',
    template: `
        <svg:path
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m.804-6.2v3a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2v-3H4.132a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h3.072v-3c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v3h2.928c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2z"
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
export class KbqCirclePlus16 extends KbqSvgIcon {}
