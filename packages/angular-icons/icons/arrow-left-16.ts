import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowLeft16]',
    template: `
        <svg:path
            d="m4.084 8.786 3.52 3.505a.2.2 0 0 1 0 .281l-.856.853a.2.2 0 0 1-.285 0l-5.322-5.3a.2.2 0 0 1 0-.282l5.322-5.3a.2.2 0 0 1 .285 0l.856.852a.2.2 0 0 1 0 .28l-3.52 3.506h10.797a.2.2 0 0 1 .201.2v1.206a.2.2 0 0 1-.201.199z"
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
export class KbqArrowLeft16 extends KbqSvgIcon {}
