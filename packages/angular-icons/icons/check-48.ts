import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheck48]',
    template: `
        <svg:path d="M44.621 13.621 20.5 37.743 5.379 22.62 9.62 18.38 20.5 29.257 40.379 9.38z" />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 48 48',
        width: '48',
        height: '48'
    }
})
export class KbqCheck48 extends KbqSvgIcon {}
