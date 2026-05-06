import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheck16]',
    template: `
        <svg:path
            d="M14.938 3.887a.204.204 0 0 1 .004.288l-8.55 8.764a.2.2 0 0 1-.289 0L1.058 7.763a.204.204 0 0 1 .004-.288l.857-.83a.2.2 0 0 1 .285.004l4.043 4.15 7.549-7.738a.2.2 0 0 1 .285-.004z"
        />
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
export class KbqCheck16 extends KbqSvgIcon {}
