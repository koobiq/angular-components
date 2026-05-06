import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqThumbsUp24]',
    template: `
        <svg:g>
            <svg:path
                d="M13.271 1.594a.29.29 0 0 1 .363-.053q.354.208.698.43c.668.426.988 1.228.79 1.983-.37 1.405-.732 2.812-1.098 4.218h6.66c1.003 0 1.816.795 1.816 1.776v1.906c0 .242-.05.479-.148.701-.514 1.156-2.25 5.05-3.396 7.448a1.78 1.78 0 0 1-1.615.997H6.355V9.158c1.202-1.416 5.982-6.56 6.916-7.564M1.5 10.926c0-.981.813-1.776 1.816-1.776H4.54V21H3.316C2.313 21 1.5 20.205 1.5 19.224z"
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
export class KbqThumbsUp24 extends KbqSvgIcon {}
