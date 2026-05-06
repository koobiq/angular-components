import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartBarHorizontal32]',
    template: `
        <svg:g>
            <svg:path d="M22 5v18h-2V5zM12 9v14h-2V9zM7 23v-6H5v6zM27 23v-4h-2v4zM17 23V13h-2v10zM29 28v-2H3v2z" />
        </svg:g>
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
export class KbqChartBarHorizontal32 extends KbqSvgIcon {}
