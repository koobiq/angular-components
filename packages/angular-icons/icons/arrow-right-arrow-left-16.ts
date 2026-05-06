import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightArrowLeft16]',
    template: `
        <svg:g>
            <svg:path
                d="M10.32 9a.203.203 0 0 0 .287 0l4.334-4.327a.2.2 0 0 0 0-.286L10.607.059a.203.203 0 0 0-.287 0l-.858.858a.2.2 0 0 0 0 .285l2.522 2.52H1.624a.2.2 0 0 0-.202.201v1.213c0 .112.09.202.203.202h10.36l-2.523 2.52a.2.2 0 0 0 0 .285z"
            />
            <svg:path
                d="M5.68 7a.203.203 0 0 0-.287 0L1.06 11.327a.2.2 0 0 0 0 .286l4.334 4.328a.203.203 0 0 0 .287 0l.858-.858a.2.2 0 0 0 0-.285l-2.522-2.52h10.36c.111 0 .202-.09.202-.202v-1.212a.2.2 0 0 0-.202-.202H4.016l2.522-2.52a.2.2 0 0 0 0-.285z"
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
export class KbqArrowRightArrowLeft16 extends KbqSvgIcon {}
