import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartBubble24]',
    template: `
        <svg:g>
            <svg:path
                d="M15.788 12.57a4.4 4.4 0 1 0-.001-8.798 4.4 4.4 0 0 0 .001 8.798M7.934 18.56a2.534 2.534 0 1 0 0-5.068 2.534 2.534 0 0 0 0 5.068M20.372 17.062a1.497 1.497 0 1 1-2.995 0 1.497 1.497 0 0 1 2.995 0"
            />
            <svg:path
                d="M1.5 1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v18.3h18.306a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.5z"
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
export class KbqChartBubble24 extends KbqSvgIcon {}
