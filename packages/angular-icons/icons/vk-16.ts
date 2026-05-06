import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqVk16]',
    template: `
        <svg:path
            d="M8.296 1c3.164 0 4.755 0 5.73.982C15 2.965 15 4.548 15 7.704v.592c0 3.157.008 4.739-.975 5.722-.983.982-2.565.982-5.73.982h-.582c-3.165 0-4.748 0-5.73-.982C1 13.035 1 11.453 1 8.296v-.592c0-3.157 0-4.739.982-5.722C2.965 1 4.548 1 7.712 1zm-4.93 4.265c.075 3.639 1.99 5.829 5.147 5.829h.182V9.012c1.15.116 2.008.974 2.358 2.082h1.657c-.45-1.657-1.616-2.573-2.34-2.923.724-.433 1.749-1.482 1.99-2.906h-1.508c-.316 1.157-1.257 2.207-2.157 2.306V5.265H7.163v4.039c-.932-.232-2.148-1.366-2.198-4.04z"
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
export class KbqVk16 extends KbqSvgIcon {}
