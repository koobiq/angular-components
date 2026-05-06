import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartLineMultiple32]',
    template: `
        <svg:path
            d="M30 26.001v2H2v-22h2v10.374l5.331-2.285 5.898-6.88a1 1 0 0 1 1.4-.118l5.322 4.435a.5.5 0 0 0 .517.076l6.099-2.614.866 2.022-7.338 3.145a.5.5 0 0 1-.517-.076l-5.07-4.225a.5.5 0 0 0-.7.059l-5.14 5.996L4 18.768v5.676l5.266-5.265a1 1 0 0 1 1.023-.242l5.317 1.772a.5.5 0 0 0 .435-.058l5.394-3.596a1 1 0 0 1 .949-.087l7.05 3.02-.867 2.023-6.204-2.658a.5.5 0 0 0-.474.043l-5.32 3.546a1 1 0 0 1-.87.117l-5.109-1.703a.5.5 0 0 0-.511.121l-4.525 4.524z"
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
export class KbqChartLineMultiple32 extends KbqSvgIcon {}
