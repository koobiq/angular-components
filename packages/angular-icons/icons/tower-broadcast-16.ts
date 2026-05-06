import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTowerBroadcast16]',
    template: `
        <svg:g>
            <svg:path
                d="M4.332 2.04a.21.21 0 0 1-.047.284 4.31 4.31 0 0 0-1.68 3.423c0 1.394.657 2.634 1.68 3.424a.21.21 0 0 1 .047.284l-.69.993a.194.194 0 0 1-.276.047A5.93 5.93 0 0 1 1 5.747 5.93 5.93 0 0 1 3.366 1a.194.194 0 0 1 .276.047zM8.803 9.051a3.4 3.4 0 0 0 2.58-3.304c0-1.877-1.515-3.4-3.383-3.4a3.39 3.39 0 0 0-3.383 3.4c0 1.6 1.1 2.942 2.58 3.304v6.748a.2.2 0 0 0 .2.201h1.206a.2.2 0 0 0 .2-.201zM13.395 5.747a4.31 4.31 0 0 0-1.68-3.423.21.21 0 0 1-.047-.284l.69-.993A.194.194 0 0 1 12.634 1 5.93 5.93 0 0 1 15 5.747a5.93 5.93 0 0 1-2.366 4.748.194.194 0 0 1-.276-.047l-.69-.993a.21.21 0 0 1 .047-.284 4.31 4.31 0 0 0 1.68-3.424"
            />
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
export class KbqTowerBroadcast16 extends KbqSvgIcon {}
