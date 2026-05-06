import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextMagnifyingGlass16]',
    template: `
        <svg:path
            d="M1.2 2.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2V2.4a.2.2 0 0 0-.2-.2zM1 6.4c0-.11.09-.2.2-.2h13.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zm.2 3.8a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.644c.001-.57.122-1.11.339-1.6zm10.608.046a1.558 1.558 0 1 1-.001 3.117 1.558 1.558 0 0 1 .001-3.117m0 4.325a2.75 2.75 0 0 0 1.481-.43l1.8 1.8a.2.2 0 0 0 .284 0l.568-.569a.2.2 0 0 0 0-.284l-1.8-1.8a2.765 2.765 0 1 0-2.334 1.284"
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
export class KbqTextMagnifyingGlass16 extends KbqSvgIcon {}
