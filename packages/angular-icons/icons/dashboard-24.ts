import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDashboard24]',
    template: `
        <svg:g>
            <svg:path
                d="M12.9 20.7a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8v-9a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8zM12.9 6.3a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8v-3a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8zM11.1 3.3a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8v9a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8zM11.1 17.7a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8v3a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8z"
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
export class KbqDashboard24 extends KbqSvgIcon {}
