import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEllipsisVertical24]',
    template: `
        <svg:g>
            <svg:path
                d="M14.25 3.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0M12 22.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
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
export class KbqEllipsisVertical24 extends KbqSvgIcon {}
