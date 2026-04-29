import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clock-badge-windows-16,[kbqClockBadgeWindows16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.6 7.883a5.4 5.4 0 0 0 4.016 5.221v1.643a7 7 0 1 1 8.333-7.711l-1.59.177a5.4 5.4 0 0 0-10.759.67"
                />
                <path
                    d="M6.793 7.948 8.8 7.723v-3.64a.2.2 0 0 0-.2-.2H7.4a.2.2 0 0 0-.2.2v3H4.467a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h2.149v-.536a.2.2 0 0 1 .177-.199M11.734 8.48c0-.056.042-.102.097-.107l4.053-.348a.107.107 0 0 1 .116.107v3.376a.107.107 0 0 1-.107.107H11.84a.107.107 0 0 1-.107-.107zM7.563 8.805a.11.11 0 0 0-.096.106v2.597c0 .06.048.107.107.107h3.277a.107.107 0 0 0 .107-.107V8.567a.107.107 0 0 0-.118-.106zM7.557 14.829a.11.11 0 0 1-.09-.106v-2.202c0-.058.048-.106.107-.106h3.277c.06 0 .107.048.107.107v2.718a.107.107 0 0 1-.123.105zM11.827 15.477a.11.11 0 0 1-.094-.106v-2.85c0-.058.048-.106.107-.106h4.053c.06 0 .107.048.107.107v3.371a.107.107 0 0 1-.12.106z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClockBadgeWindows16 extends KbqSvgIcon {}
