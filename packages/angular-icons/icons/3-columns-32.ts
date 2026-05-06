import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbq3Columns32]',
    template: `
        <svg:path
            d="M25 27a2 2 0 0 0 2-2V7.002a2 2 0 0 0-2.002-2L6 5.018a2 2 0 0 0-1.999 2V25a2 2 0 0 0 2 2zM6 25V7.016L11 7v18zm12 0h-5V7.016L18 7zm2 0V7.016L25 7v18z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class Kbq3Columns32 extends KbqSvgIcon {}
