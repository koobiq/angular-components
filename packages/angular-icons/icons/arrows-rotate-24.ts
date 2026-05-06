import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRotate24]',
    template: `
        <svg:g>
            <svg:path
                d="m3.55 20.443-.413.414a.3.3 0 0 1-.504-.145l-1.362-5.9a.3.3 0 0 1 .36-.36l5.9 1.362a.3.3 0 0 1 .144.505L6.27 17.724a8.1 8.1 0 0 0 13.81-5.14.153.153 0 0 1 .186-.138l1.938.447c.146.034.245.17.228.32C21.83 18.44 17.389 22.5 12 22.5a10.47 10.47 0 0 1-7.43-3.079zM20.45 3.566l.412-.414a.3.3 0 0 1 .505.145l1.361 5.899a.3.3 0 0 1-.36.36L16.47 8.194a.3.3 0 0 1-.145-.504l1.41-1.41A8.1 8.1 0 0 0 3.92 11.416a.153.153 0 0 1-.185.139l-1.938-.448a.295.295 0 0 1-.228-.32C2.17 5.56 6.611 1.5 12 1.5c2.903 0 5.532 1.178 7.432 3.083z"
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
export class KbqArrowsRotate24 extends KbqSvgIcon {}
