import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEject16]',
    template: `
        <svg:g>
            <svg:path
                d="m1 11.2 6.836-9.11a.2.2 0 0 1 .328 0L15 11.2zM15 13.8a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2v-1.4h14z"
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
export class KbqEject16 extends KbqSvgIcon {}
