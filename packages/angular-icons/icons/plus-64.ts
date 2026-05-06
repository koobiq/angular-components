import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlus64]',
    template: `
        <svg:path
            d="M29.109 8.546C29 8.76 29 9.04 29 9.6V29H9.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C8 29.76 8 30.04 8 30.6v2.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C8.76 35 9.04 35 9.6 35H29v19.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C29.76 56 30.04 56 30.6 56h2.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C35 55.24 35 54.96 35 54.4V35h19.4c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C56 34.24 56 33.96 56 33.4v-2.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C55.24 29 54.96 29 54.4 29H35V9.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C34.24 8 33.96 8 33.4 8h-2.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 64 64',
        width: '64',
        height: '64'
    }
})
export class KbqPlus64 extends KbqSvgIcon {}
