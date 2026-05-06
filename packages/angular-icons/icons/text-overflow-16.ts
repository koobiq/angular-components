import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextOverflow16]',
    template: `
        <svg:path
            d="M15.8 3.585a.2.2 0 0 0 .2-.2V2.2a.2.2 0 0 0-.2-.2H.2a.2.2 0 0 0-.2.2v1.185c0 .11.09.2.2.2zM16 13.8a.2.2 0 0 1-.2.2H.2a.2.2 0 0 1-.2-.2v-1.186c0-.11.09-.2.2-.2h15.6c.11 0 .2.09.2.2zM.2 8.798h11.59v1.573a.2.2 0 0 0 .306.17l3.81-2.365a.2.2 0 0 0 0-.34l-3.81-2.366a.2.2 0 0 0-.306.17v1.573H.2a.2.2 0 0 0-.2.2v1.185c0 .11.09.2.2.2"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 17 16',
        width: '17',
        height: '16'
    }
})
export class KbqTextOverflow16 extends KbqSvgIcon {}
