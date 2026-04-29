import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clock-badge-windows-24,[kbqClockBadgeWindows24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.9 11.825a8.1 8.1 0 0 0 6.024 7.832v2.463C5.119 21.156 1.5 16.913 1.5 11.825c0-5.799 4.701-10.5 10.5-10.5 5.368 0 9.796 4.029 10.424 9.228l-2.386.267A8.101 8.101 0 0 0 3.9 11.825"
                />
                <path
                    d="m10.19 11.922 3.01-.337v-5.46a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v4.5H6.7a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h3.224v-.805a.3.3 0 0 1 .266-.298M17.6 12.72a.16.16 0 0 1 .146-.16l6.08-.522a.16.16 0 0 1 .174.16v5.064a.16.16 0 0 1-.16.16h-6.08a.16.16 0 0 1-.16-.16zM11.344 13.208a.16.16 0 0 0-.143.159v3.895c0 .089.072.16.16.16h4.916a.16.16 0 0 0 .16-.16V12.85a.16.16 0 0 0-.177-.159zM11.336 22.243a.16.16 0 0 1-.135-.158v-3.303a.16.16 0 0 1 .16-.16h4.916a.16.16 0 0 1 .16.16v4.078a.16.16 0 0 1-.185.158zM17.74 23.215a.16.16 0 0 1-.14-.159v-4.274a.16.16 0 0 1 .16-.16h6.08a.16.16 0 0 1 .16.16v5.058a.16.16 0 0 1-.18.159z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClockBadgeWindows24 extends KbqSvgIcon {}
