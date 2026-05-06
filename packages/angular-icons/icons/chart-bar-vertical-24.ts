import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartBarVertical24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 22.2a.3.3 0 0 0 .3.3h2.1v-21H1.8a.3.3 0 0 0-.3.3zM6 22.5h11.7a.3.3 0 0 0 .3-.3v-3.9a.3.3 0 0 0-.3-.3H6zM6 6h16.2a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3H6zM13.2 14.25a.3.3 0 0 0 .3-.3v-3.9a.3.3 0 0 0-.3-.3H6v4.5z"
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
export class KbqChartBarVertical24 extends KbqSvgIcon {}
