import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSplitScreenRight16]',
    template: `
        <svg:path
            d="M15 12.8a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 12.8V3.2A1.2 1.2 0 0 1 2.2 2h11.6A1.2 1.2 0 0 1 15 3.2zm-5.2-.4a.2.2 0 0 0 .2-.2V3.8a.2.2 0 0 0-.2-.2h-7a.2.2 0 0 0-.2.2v8.4c0 .11.09.2.2.2z"
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
export class KbqSplitScreenRight16 extends KbqSvgIcon {}
