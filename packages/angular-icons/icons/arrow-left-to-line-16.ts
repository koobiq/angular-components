import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowLeftToLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M10.286 11.575a.2.2 0 0 0 0-.281L7.824 8.8H14.8a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2H7.824l2.462-2.494a.2.2 0 0 0 0-.281l-.836-.847a.2.2 0 0 0-.285 0L4.94 7.86a.2.2 0 0 0 0 .281l4.226 4.281a.2.2 0 0 0 .285 0zM2.2 1a.2.2 0 0 0-.2.2v13.6c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2z"
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
export class KbqArrowLeftToLine16 extends KbqSvgIcon {}
