import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqXmark32]',
    template: `
        <svg:path
            d="m18.117 15.995 7.364 7.364-2.122 2.122-7.364-7.364-7.364 7.364-2.121-2.122 7.364-7.364L6.51 8.631 8.631 6.51l7.364 7.364L23.36 6.51l2.122 2.121z"
        />
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
export class KbqXmark32 extends KbqSvgIcon {}
