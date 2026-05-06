import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalThinLines16]',
    template: `
        <svg:path
            d="M4 1.2A1.2 1.2 0 0 1 5.2 0h5.6A1.2 1.2 0 0 1 12 1.2v13.6a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 14.8zm1.6.6v4.105L9.905 1.6H5.8a.2.2 0 0 0-.2.2m0 9.302v1.803l4.8-4.8V6.302zm0-1.697 4.8-4.8V2.802l-4.8 4.8zm4.6 4.995a.2.2 0 0 0 .2-.2V9.802L5.802 14.4z"
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
export class KbqRectangleVerticalThinLines16 extends KbqSvgIcon {}
