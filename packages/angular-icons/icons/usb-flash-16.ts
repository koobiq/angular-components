import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUsbFlash16]',
    template: `
        <svg:g>
            <svg:path
                d="M11.96.06a.2.2 0 0 0-.285 0L8.973 2.77l4.266 4.28 2.702-2.711a.2.2 0 0 0 0-.285zm-.104 1.82.568.571a.2.2 0 0 1 0 .286l-.568.57a.2.2 0 0 1-.285 0l-.569-.57a.2.2 0 0 1 0-.286l.57-.57a.2.2 0 0 1 .284 0m2.275 2.283a.2.2 0 0 1 0 .285l-.569.571a.2.2 0 0 1-.284 0l-.57-.57a.2.2 0 0 1 0-.286l.57-.57a.2.2 0 0 1 .284 0zM7.187 2.694a.027.027 0 0 0-.039 0L1.996 7.865a4.347 4.347 0 0 0 0 6.135 4.314 4.314 0 0 0 6.114 0l5.153-5.172a.027.027 0 0 0 0-.038z"
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
export class KbqUsbFlash16 extends KbqSvgIcon {}
