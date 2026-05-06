import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsLeft24]',
    template: `
        <svg:path
            d="M1.588 8.109a.3.3 0 0 1 0-.426l6.463-6.47a.3.3 0 0 1 .427 0L9.76 2.497a.3.3 0 0 1 0 .426L5.997 6.688h16.201c.167 0 .302.135.302.301v1.814a.3.3 0 0 1-.302.301H5.997l3.762 3.767a.3.3 0 0 1 0 .425l-1.28 1.282a.3.3 0 0 1-.428 0zM22.5 15.197a.3.3 0 0 0-.302-.301H10.722l-2.415 2.417h13.891a.3.3 0 0 0 .302-.302zM5.997 17.313h2.225l-4.027-4.031-2.607 2.61a.3.3 0 0 0 0 .425l6.463 6.47c.118.118.31.118.427 0l1.281-1.283a.3.3 0 0 0 0-.425z"
        />
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
export class KbqArrowsLeft24 extends KbqSvgIcon {}
