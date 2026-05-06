import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListCircleXmark24]',
    template: `
        <svg:g>
            <svg:path
                d="M2.788 12.088a.3.3 0 0 1 .425 0l2.973 2.973 2.962-2.962a.3.3 0 0 1 .425 0l1.697 1.697a.3.3 0 0 1 0 .424l-2.963 2.962 2.966 2.967a.3.3 0 0 1 0 .424L9.576 22.27a.3.3 0 0 1-.424 0l-2.966-2.966-2.977 2.977a.3.3 0 0 1-.425 0l-1.696-1.697a.3.3 0 0 1 0-.424l2.975-2.977-2.972-2.973a.3.3 0 0 1 0-.425zM23.6 15c.22 0 .4.18.4.4v3.2a.4.4 0 0 1-.4.4h-9.2a.4.4 0 0 1-.4-.4v-3.2c0-.22.18-.4.4-.4zM6 1a5 5 0 1 1 0 10A5 5 0 0 1 6 1M23.6 4c.22 0 .4.18.4.4v3.2a.4.4 0 0 1-.4.4h-9.2a.4.4 0 0 1-.4-.4V4.4c0-.22.18-.4.4-.4z"
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
export class KbqListCircleXmark24 extends KbqSvgIcon {}
