import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-rotate-left-badge-windows-16,[kbqArrowRotateLeftBadgeWindows16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M5.289 12.678c.426.246.872.427 1.327.547v1.642a7 7 0 0 1-2.127-.804 6.97 6.97 0 0 1-3.054-3.602l1.424-.774a5.38 5.38 0 0 0 2.43 2.99M10.689 3.325a5.39 5.39 0 0 1 2.643 3.891l1.59-.178A7 7 0 0 0 1.926 4.501l-.822-.474-.337-.195a.2.2 0 0 0-.3.18l.14 4.033a.2.2 0 0 0 .295.17L4.466 6.32a.2.2 0 0 0 .006-.35l-1.16-.668a5.4 5.4 0 0 1 7.377-1.977M11.734 8.48c0-.056.042-.102.097-.107l4.053-.348a.107.107 0 0 1 .116.107v3.376a.107.107 0 0 1-.107.107H11.84a.107.107 0 0 1-.107-.107zM7.563 8.805a.11.11 0 0 0-.096.106v2.597c0 .06.048.107.107.107h3.277a.107.107 0 0 0 .107-.107V8.567a.107.107 0 0 0-.118-.106zM7.557 14.829a.11.11 0 0 1-.09-.106v-2.202c0-.058.048-.106.107-.106h3.277c.06 0 .107.048.107.107v2.718a.107.107 0 0 1-.123.105zM11.827 15.477a.11.11 0 0 1-.093-.106v-2.85c0-.058.047-.106.106-.106h4.053c.06 0 .107.048.107.107v3.371a.107.107 0 0 1-.12.106z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRotateLeftBadgeWindows16 extends KbqSvgIcon {}
