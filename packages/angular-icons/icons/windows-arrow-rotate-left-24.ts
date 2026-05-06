import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWindowsArrowRotateLeft24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.933 19.017c.64.37 1.31.641 1.99.82v2.464a10.5 10.5 0 0 1-3.19-1.206 10.46 10.46 0 0 1-4.58-5.404l2.135-1.16a8.07 8.07 0 0 0 3.645 4.486M16.033 4.987a8.09 8.09 0 0 1 3.964 5.837l2.387-.267a10.48 10.48 0 0 0-5.15-7.648C12.21.009 5.788 1.73 2.89 6.752L1.655 6.04l-.505-.293a.3.3 0 0 0-.45.27l.212 6.051a.3.3 0 0 0 .44.255L6.698 9.48a.3.3 0 0 0 .01-.525l-1.74-1.004a8.1 8.1 0 0 1 11.065-2.965M17.6 12.72a.16.16 0 0 1 .146-.16l6.08-.522a.16.16 0 0 1 .174.16v5.064a.16.16 0 0 1-.16.16h-6.08a.16.16 0 0 1-.16-.16zM11.344 13.208a.16.16 0 0 0-.143.159v3.895c0 .089.072.16.16.16h4.916a.16.16 0 0 0 .16-.16V12.85a.16.16 0 0 0-.177-.159zM11.336 22.243a.16.16 0 0 1-.135-.158v-3.303a.16.16 0 0 1 .16-.16h4.916a.16.16 0 0 1 .16.16v4.078a.16.16 0 0 1-.185.158zM17.74 23.215a.16.16 0 0 1-.14-.159v-4.274a.16.16 0 0 1 .16-.16h6.08a.16.16 0 0 1 .16.16v5.058a.16.16 0 0 1-.18.159z"
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
export class KbqWindowsArrowRotateLeft24 extends KbqSvgIcon {}
