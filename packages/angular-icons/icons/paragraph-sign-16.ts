import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqParagraphSign16]',
    template: `
        <svg:path
            d="M3.75 1.5a3.75 3.75 0 0 0 0 7.5H5v5.3c0 .11.09.2.2.2h1.788a.2.2 0 0 0 .2-.2V3.258h3.124V14.3c0 .11.09.2.2.2H12.3a.2.2 0 0 0 .2-.2V3.258h3.3a.2.2 0 0 0 .2-.2V1.7a.2.2 0 0 0-.2-.2z"
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
export class KbqParagraphSign16 extends KbqSvgIcon {}
