import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsVertical16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 14c-.11 0-.2-.067-.2-.15V2.15c0-.083.09-.15.2-.15h2.1c.11 0 .2.067.2.15v11.7c0 .083-.09.15-.2.15zM11.7 14c-.11 0-.2-.067-.2-.15V2.15c0-.083.09-.15.2-.15h2.1c.11 0 .2.067.2.15v11.7c0 .083-.09.15-.2.15zM6.95 2c-.11 0-.2.067-.2.15v11.7c0 .083.09.15.2.15h2.1c.11 0 .2-.067.2-.15V2.15c0-.083-.09-.15-.2-.15z"
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
export class KbqBarsVertical16 extends KbqSvgIcon {}
