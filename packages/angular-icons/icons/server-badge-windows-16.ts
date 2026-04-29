import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-server-badge-windows-16,[kbqServerBadgeWindows16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M15.894 12.415c.058 0 .106.048.106.107v3.372a.107.107 0 0 1-.12.105l-4.054-.522a.11.11 0 0 1-.093-.106v-2.85c0-.058.048-.106.107-.106zM10.852 12.415c.058 0 .106.048.106.107v2.718a.107.107 0 0 1-.123.106l-3.277-.517a.11.11 0 0 1-.09-.105V12.52c0-.058.047-.106.106-.106zM6.267 13.436h-.001V15H2.2A1.2 1.2 0 0 1 1 13.8v-1.6A1.2 1.2 0 0 1 2.2 11h4.067zM3.5 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2M10.84 8.46a.107.107 0 0 1 .118.107v2.942a.107.107 0 0 1-.106.106H7.574a.107.107 0 0 1-.106-.106V8.91c0-.054.04-.1.095-.105zM15.884 8.025a.107.107 0 0 1 .116.107v3.377a.107.107 0 0 1-.106.106H11.84a.107.107 0 0 1-.107-.106v-3.03c0-.055.043-.101.098-.106z"
                />
                <path
                    d="M13.8 6c.56 0 1.028.384 1.16.902-2.194.191-4.387.39-6.577.614l-1.937.19a.2.2 0 0 0-.18.198V10H2.2A1.2 1.2 0 0 1 1 8.8V7.2A1.2 1.2 0 0 1 2.2 6zM3.5 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2M13.8 1A1.2 1.2 0 0 1 15 2.2v1.6A1.2 1.2 0 0 1 13.8 5H2.2A1.2 1.2 0 0 1 1 3.8V2.2A1.2 1.2 0 0 1 2.2 1zM3.5 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4.2.4a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqServerBadgeWindows16 extends KbqSvgIcon {}
