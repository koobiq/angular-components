import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTimeMessengerAlt16]',
    template: `
        <svg:path
            d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3zM6.16 5.247c-1.038-1.457-3.164-.64-3.164 1.211v2.878c0 1.852 2.126 2.667 3.163 1.21l.026-.036 1.81-2.61-1.81-2.615zM13 6.368c0-1.85-2.126-2.666-3.163-1.21l-.026.037L8 7.813l1.81 2.617.027.036C10.874 11.92 13 11.106 13 9.249z"
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
export class KbqTimeMessengerAlt16 extends KbqSvgIcon {}
