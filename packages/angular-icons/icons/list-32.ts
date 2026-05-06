import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqList32]',
    template: `
        <svg:g><svg:path d="M9 6H5v4h4zM12 7h15v2H12zM27 15H12v2h15zM27 23H12v2h15zM9 22H5v4h4zM5 14h4v4H5z" /></svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqList32 extends KbqSvgIcon {}
