import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserBadgeTriangleUp16]',
    template: `
        <svg:path
            d="M11 4.5c0 1.933-1.343 4-3 4s-3-2.067-3-4S6.343 1 8 1s3 1.567 3 3.5m-.024 3.586C10.298 8.959 9.275 9.7 8 9.7s-2.298-.741-2.976-1.614l-3.282 1.969a1.2 1.2 0 0 0-.554 1.29l.777 3.498A.2.2 0 0 0 2.16 15h6.053l1.816-2.862q.024-.045.051-.088l2.068-3.261zM9.364 16a.2.2 0 0 1-.17-.307l3.126-4.928a.2.2 0 0 1 .337 0l3.147 4.927a.2.2 0 0 1-.169.308z"
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
export class KbqUserBadgeTriangleUp16 extends KbqSvgIcon {}
