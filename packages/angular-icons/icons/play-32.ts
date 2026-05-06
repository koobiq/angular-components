import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlay32]',
    template: `
        <svg:path
            d="M7 6.355c0-1.036.797-1.676 1.686-1.143l16.075 9.645a1.333 1.333 0 0 1 0 2.287L8.686 26.789C7.797 27.322 7 26.682 7 25.646z"
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
export class KbqPlay32 extends KbqSvgIcon {}
