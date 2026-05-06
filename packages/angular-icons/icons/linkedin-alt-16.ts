import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLinkedinAlt16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.997 13.544h-3v-8.8h3zM11.632 4.536C13.557 4.536 15 5.795 15 8.498v5.046h-2.925V8.836c0-1.183-.424-1.99-1.482-1.99-.808 0-1.29.544-1.501 1.069-.077.188-.096.45-.096.714v4.915H6.07c0-.049.039-7.975 0-8.8h2.926V5.99c.389-.6 1.084-1.454 2.636-1.454M2.506.5c1 0 1.617.657 1.636 1.52 0 .845-.636 1.521-1.656 1.521h-.018c-.982 0-1.616-.676-1.616-1.52C.852 1.157 1.505.5 2.506.5"
            />
        </svg:g>
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
export class KbqLinkedinAlt16 extends KbqSvgIcon {}
