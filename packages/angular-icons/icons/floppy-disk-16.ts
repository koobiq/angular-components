import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFloppyDisk16]',
    template: `
        <svg:path
            d="M11.503 1a1.2 1.2 0 0 1 .848.351l2.297 2.298a1.2 1.2 0 0 1 .352.848V13.8a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V2.2A1.2 1.2 0 0 1 2.2 1zM11 2.4a.2.2 0 0 0-.2-.2H9.6v2.4a.2.2 0 0 1-.2.2H8.2a.2.2 0 0 1-.2-.2V2.2H4.2a.2.2 0 0 0-.2.2v3.4c0 .11.09.2.2.2h6.6a.2.2 0 0 0 .2-.2zM3 8.6v4.6c0 .11.09.2.2.2h9.6a.2.2 0 0 0 .2-.2V8.6a.2.2 0 0 0-.2-.2H3.2a.2.2 0 0 0-.2.2"
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
export class KbqFloppyDisk16 extends KbqSvgIcon {}
