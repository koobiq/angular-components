import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderOpenBadgeMagnifyingGlass24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 3.3 21h.048L7.94 10.669A1.8 1.8 0 0 1 9.585 9.6H22.5V7.8A1.8 1.8 0 0 0 20.7 6H12L9 3zM19.934 21.21a4.147 4.147 0 0 1-6.367-3.503 4.147 4.147 0 0 1 4.145-4.148 4.147 4.147 0 0 1 3.5 6.37l2.7 2.702a.3.3 0 0 1 0 .427l-.853.853a.3.3 0 0 1-.426 0zm.115-3.503a2.337 2.337 0 1 0-4.675-.002 2.337 2.337 0 0 0 4.675.002"
            />
            <svg:path
                d="m5.318 21 4.188-9.422a.3.3 0 0 1 .274-.179h13.759a.3.3 0 0 1 .274.422l-1.15 2.591A5.947 5.947 0 0 0 12.76 21z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqFolderOpenBadgeMagnifyingGlass24 extends KbqSvgIcon {}
