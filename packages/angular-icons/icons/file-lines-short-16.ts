import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileLinesShort16]',
    template: `
        <svg:path
            d="M2 1.2A1.2 1.2 0 0 1 3.2 0h9.6A1.2 1.2 0 0 1 14 1.2v13.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8zM4 4c0 .11.09.2.2.2h3.6A.2.2 0 0 0 8 4v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2z"
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
export class KbqFileLinesShort16 extends KbqSvgIcon {}
