import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownRight16]',
    template: `
        <svg:path
            d="M10.247 11.388H5.27a.2.2 0 0 0-.201.201v1.21c0 .11.09.201.201.201h7.53c.11 0 .201-.09.201-.202V5.27a.2.2 0 0 0-.201-.201h-1.21a.2.2 0 0 0-.201.201v4.979L3.749 2.609a.2.2 0 0 0-.285 0l-.855.855a.2.2 0 0 0 0 .285z"
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
export class KbqArrowDownRight16 extends KbqSvgIcon {}
