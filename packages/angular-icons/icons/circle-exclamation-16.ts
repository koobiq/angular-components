import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleExclamation16]',
    template: `
        <svg:path
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m.927-10.784-.311 4.951a.2.2 0 0 1-.2.188h-.834a.2.2 0 0 1-.2-.188l-.309-4.951a.2.2 0 0 1 .2-.213h1.454a.2.2 0 0 1 .2.213M8 11.807a.887.887 0 1 1 0-1.773.887.887 0 0 1 0 1.773"
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
export class KbqCircleExclamation16 extends KbqSvgIcon {}
