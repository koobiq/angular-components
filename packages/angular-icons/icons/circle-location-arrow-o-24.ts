import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleLocationArrowO24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.677 11.668a.338.338 0 0 0 .019.635l4.34 1.447c.101.033.18.113.214.213l1.447 4.341c.1.299.518.311.635.019l4.143-10.359a.338.338 0 0 0-.44-.439z"
            />
            <svg:path
                d="M12 20.1a8.1 8.1 0 1 1 0-16.2 8.1 8.1 0 0 1 0 16.2m0 2.4c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5"
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
export class KbqCircleLocationArrowO24 extends KbqSvgIcon {}
