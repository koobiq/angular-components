import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqText16]',
    template: `
        <svg:path
            d="M9.17 14.3V3.258h4.13a.2.2 0 0 0 .2-.2V1.7a.2.2 0 0 0-.2-.2H2.7a.2.2 0 0 0-.2.2v1.358c0 .11.09.2.2.2h4.281V14.3c0 .11.09.2.2.2H8.97a.2.2 0 0 0 .2-.2"
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
export class KbqText16 extends KbqSvgIcon {}
