import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSplitScreenNoSplit16]',
    template: `
        <svg:path
            d="M2.8 3.6h10.4c.11 0 .2.09.2.2v8.4a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2V3.8c0-.11.09-.2.2-.2M2.2 2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V3.2A1.2 1.2 0 0 0 13.8 2z"
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
export class KbqSplitScreenNoSplit16 extends KbqSvgIcon {}
