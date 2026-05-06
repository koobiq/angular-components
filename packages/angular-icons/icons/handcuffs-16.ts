import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHandcuffs16]',
    template: `
        <svg:path
            d="M4.8 4.588c0-.78.409-1.425.947-1.758.521-.322 1.147-.353 1.715.063q.273.2.473.379l-.716.709c-.092.091-.106.226-.03.3l.949.94a3.93 3.93 0 0 0 1.036 3.827 4.03 4.03 0 0 0 5.656 0 3.935 3.935 0 0 0 0-5.602 4.03 4.03 0 0 0-3.864-1.026l-.949-.94c-.075-.075-.211-.062-.303.03l-.647.64a7 7 0 0 0-.655-.533C7.26.777 5.918.856 4.9 1.486c-1 .618-1.7 1.767-1.7 3.102v1.999h-.964c-.13 0-.236.085-.236.191v1.329a3.95 3.95 0 0 0-2 3.432C0 13.726 1.79 15.5 4 15.5s4-1.774 4-3.961a3.95 3.95 0 0 0-2-3.432V6.778c0-.106-.105-.191-.236-.191H4.8zm8.899-.022a2.36 2.36 0 0 1 0 3.361 2.417 2.417 0 0 1-3.394 0 2.36 2.36 0 0 1 0-3.361 2.417 2.417 0 0 1 3.394 0M6.4 11.539c0 1.312-1.075 2.376-2.4 2.376s-2.4-1.064-2.4-2.376c0-1.313 1.075-2.377 2.4-2.377s2.4 1.064 2.4 2.377"
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
export class KbqHandcuffs16 extends KbqSvgIcon {}
