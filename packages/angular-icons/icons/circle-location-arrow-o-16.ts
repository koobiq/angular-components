import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleLocationArrowO16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.785 7.779a.225.225 0 0 0 .012.423l2.894.964c.067.023.12.076.143.143l.964 2.894c.066.199.345.207.423.012l2.762-6.905a.225.225 0 0 0-.293-.293z"
            />
            <svg:path d="M8 13.4A5.4 5.4 0 1 1 8 2.6a5.4 5.4 0 0 1 0 10.8M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" />
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
export class KbqCircleLocationArrowO16 extends KbqSvgIcon {}
