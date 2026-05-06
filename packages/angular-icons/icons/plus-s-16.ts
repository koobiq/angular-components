import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlusS16]',
    template: `
        <svg:path
            d="M8.871 8.8H12.8a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2H8.871v-4a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v4H3.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h4.071v4c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2z"
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
export class KbqPlusS16 extends KbqSvgIcon {}
