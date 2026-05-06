import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderO32]',
    template: `
        <svg:path
            d="M3 25V5a2 2 0 0 1 2-2h9.735c.772 0 1.473.446 1.845 1.124C17.228 5.307 18.28 7 19 7h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2m2 0h24V13H5zm0-14h24V9H19c-1.43 0-2.684-1.675-3.392-2.858C15.205 5.466 14.493 5 13.705 5H5z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqFolderO32 extends KbqSvgIcon {}
