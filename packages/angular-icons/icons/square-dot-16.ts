import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSquareDot16]',
    template: `
        <svg:g fill="currentColor">
            <svg:path d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            <svg:path d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
        </svg:g>
        <svg:path
            d="M15 5.04q-.474.158-1 .16A3.2 3.2 0 0 1 10.96 1H2.2A1.2 1.2 0 0 0 1 2.2v11.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2z"
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
export class KbqSquareDot16 extends KbqSvgIcon {}
