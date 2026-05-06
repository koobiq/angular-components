import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderBadgeMagnifyingGlass24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 4.8A1.8 1.8 0 0 1 3.3 3h4.2l2.7 2.7H1.5zM19.934 21.21a4.147 4.147 0 0 1-6.367-3.503 4.147 4.147 0 0 1 4.145-4.148 4.147 4.147 0 0 1 3.5 6.372l2.7 2.7a.3.3 0 0 1 0 .427l-.853.854a.3.3 0 0 1-.426 0zm.115-3.502a2.337 2.337 0 1 0-4.675-.002 2.337 2.337 0 0 0 4.675.002"
            />
            <svg:path
                d="M1.5 7.5v11.7A1.8 1.8 0 0 0 3.3 21h9.46a5.947 5.947 0 0 1 9.74-6.82V9.3a1.8 1.8 0 0 0-1.8-1.8z"
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
export class KbqFolderBadgeMagnifyingGlass24 extends KbqSvgIcon {}
