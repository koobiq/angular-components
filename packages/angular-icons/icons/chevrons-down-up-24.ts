import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronsDownUp24]',
    template: `
        <svg:path
            d="M19.214.087 12 7.17 4.787.087a.305.305 0 0 0-.427 0L3.09 1.333a.304.304 0 0 0 .001.434l8.696 8.538a.305.305 0 0 0 .426 0l8.696-8.538a.304.304 0 0 0 0-.434L19.64.087a.305.305 0 0 0-.427 0M4.787 23.913 12 16.83l7.214 7.083a.305.305 0 0 0 .426 0l1.27-1.246a.304.304 0 0 0 0-.433l-8.697-8.54a.305.305 0 0 0-.426 0l-8.696 8.54a.304.304 0 0 0 0 .433l1.269 1.246a.305.305 0 0 0 .426 0"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqChevronsDownUp24 extends KbqSvgIcon {}
