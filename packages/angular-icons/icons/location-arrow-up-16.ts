import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLocationArrowUp16]',
    template: `
        <svg:path
            d="M12.764 10.99q.03.01.06.008a.204.204 0 0 0 .144-.31L8.175 3.095a.208.208 0 0 0-.35 0l-4.793 7.591c-.08.128 0 .29.144.31q.03.004.06-.006L8 9.5z"
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
export class KbqLocationArrowUp16 extends KbqSvgIcon {}
