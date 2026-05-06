import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDesktopBadgeWindows16]',
    template: `
        <svg:g>
            <svg:path
                d="M15.894 12.415c.058 0 .106.048.106.107v3.372a.107.107 0 0 1-.12.105l-4.054-.522a.11.11 0 0 1-.093-.106v-2.85c0-.058.048-.106.107-.106zM10.852 12.415c.058 0 .106.048.106.107v2.718a.107.107 0 0 1-.123.106l-3.277-.517a.11.11 0 0 1-.09-.105V12.52c0-.058.047-.106.106-.106z"
            />
            <svg:path
                d="M13.8 1A1.2 1.2 0 0 1 15 2.2v4.698l-1.6.15V2.8a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2v6.4c0 .11.09.2.2.2h3.465v5.324q0 .142.03.276H3v-1.6h2V11H2.2A1.2 1.2 0 0 1 1 9.8V2.2A1.2 1.2 0 0 1 2.2 1z"
            />
            <svg:path
                d="M10.84 8.46a.107.107 0 0 1 .118.107v2.942a.107.107 0 0 1-.106.106H7.574a.107.107 0 0 1-.106-.106V8.91c0-.054.04-.1.095-.105zM15.884 8.025a.107.107 0 0 1 .116.107v3.377a.107.107 0 0 1-.106.106H11.84a.107.107 0 0 1-.107-.106v-3.03c0-.055.043-.101.098-.106z"
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
export class KbqDesktopBadgeWindows16 extends KbqSvgIcon {}
