import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronsUpDown24]',
    template: `
        <svg:path
            d="M4.787 10.305 12 3.222l7.214 7.083a.305.305 0 0 0 .426 0l1.27-1.246a.304.304 0 0 0 0-.433L12.212.087a.305.305 0 0 0-.426 0L3.09 8.626a.304.304 0 0 0 0 .433l1.269 1.246a.305.305 0 0 0 .426 0m14.427 3.39L12 20.778l-7.213-7.083a.305.305 0 0 0-.427 0L3.09 14.94a.304.304 0 0 0 .001.433l8.696 8.539a.305.305 0 0 0 .426 0l8.696-8.539a.304.304 0 0 0 0-.433l-1.269-1.246a.305.305 0 0 0-.427 0"
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
export class KbqChevronsUpDown24 extends KbqSvgIcon {}
