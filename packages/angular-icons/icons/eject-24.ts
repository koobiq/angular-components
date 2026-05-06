import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEject24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 16.8 11.754 3.135a.3.3 0 0 1 .492 0L22.5 16.8zM22.5 20.7a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-2.1h21z"
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
export class KbqEject24 extends KbqSvgIcon {}
