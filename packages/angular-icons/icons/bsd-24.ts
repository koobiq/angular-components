import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBsd24]',
    template: `
        <svg:g>
            <svg:path
                d="M14.89 5.081s6.252-4.544 7.422-3.395c1.17 1.147-3.49 7.448-3.49 7.448-3.561-1.207-3.932-4.053-3.932-4.053M3.27 1.612c-.94.626.21 3.667.21 3.667S4.492 3.072 6.775 3.2c0 0-2.564-2.214-3.505-1.587"
            />
            <svg:path
                d="m13.839 3.62-.872.634q.024.187.046.377c.036.318.073.637.14.95.028.132.07.304.135.507.128.404.344.94.705 1.52.739 1.184 2.043 2.482 4.25 3.23l1.245.423.78-1.057.006-.007.012-.016.042-.058a31 31 0 0 0 .304-.423c.304.945.468 1.953.468 3 0 5.412-4.388 9.8-9.8 9.8s-9.8-4.388-9.8-9.8 4.388-9.8 9.8-9.8c1.02 0 2.003.156 2.927.445l-.102.072-.212.15-.058.042z"
            />
        </svg:g>
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
export class KbqBsd24 extends KbqSvgIcon {}
