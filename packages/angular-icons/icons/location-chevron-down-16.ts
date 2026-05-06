import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLocationChevronDown16]',
    template: `
        <svg:path
            d="M3.236 5.01a.14.14 0 0 0-.06-.008.204.204 0 0 0-.144.31l4.793 7.592c.08.128.27.128.35 0l4.793-7.591a.204.204 0 0 0-.145-.31.14.14 0 0 0-.06.006L8 6.5z"
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
export class KbqLocationChevronDown16 extends KbqSvgIcon {}
