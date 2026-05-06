import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqApple24]',
    template: `
        <svg:path
            d="M18.057 12.602c0-1.69.775-2.937 2.279-3.91a.13.13 0 0 0 .035-.19c-.91-1.192-2.224-1.813-3.944-1.95-1.726-.14-3.596.938-4.268.938-.72 0-2.35-.891-3.644-.891C5.829 6.646 3 8.663 3 12.837c0 1.22.192 2.486.671 3.799.624 1.735 2.83 5.956 5.131 5.863 1.2 0 2.062-.845 3.645-.845 1.534 0 2.302.845 3.644.845 2.301 0 4.28-3.689 4.902-5.471a.133.133 0 0 0-.07-.162c-3.006-1.466-2.866-4.171-2.866-4.264m-2.685-7.691c1.19-1.38 1.165-2.681 1.153-3.283a.13.13 0 0 0-.14-.127c-1.12.136-2.386.817-3.123 1.627-.837.91-1.314 2.041-1.254 3.265a.124.124 0 0 0 .118.119c1.204.05 2.315-.555 3.246-1.601"
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
export class KbqApple24 extends KbqSvgIcon {}
