import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBoxArchiveArrowDown16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.2 1A1.2 1.2 0 0 0 1 2.2v1.6A1.2 1.2 0 0 0 2.2 5h11.6A1.2 1.2 0 0 0 15 3.8V2.2A1.2 1.2 0 0 0 13.8 1zM2 6.2h5.4V8.32H5.69c-.148 0-.24.148-.161.262l2.309 3.36c.074.108.25.108.324 0l2.31-3.36a.16.16 0 0 0-.025-.208.2.2 0 0 0-.138-.054H8.6V6.2H14v7.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 13.8z"
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
export class KbqBoxArchiveArrowDown16 extends KbqSvgIcon {}
