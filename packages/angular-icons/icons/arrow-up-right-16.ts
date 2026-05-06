import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpRight16]',
    template: `
        <svg:path
            d="M10.247 4.612H5.27a.2.2 0 0 1-.201-.201V3.2c0-.11.09-.201.201-.201h7.53c.11 0 .201.09.201.202v7.529c0 .111-.09.201-.201.201h-1.21a.2.2 0 0 1-.201-.201V5.752l-7.639 7.639a.2.2 0 0 1-.285 0l-.855-.855a.2.2 0 0 1 0-.285z"
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
export class KbqArrowUpRight16 extends KbqSvgIcon {}
