import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGripVerticalS16]',
    template: `
        <svg:g><svg:path d="M5 3v2h2V3zM5 7v2h2V7zM5 11v2h2v-2zM9 11v2h2v-2zM9 9V7h2v2zM9 5V3h2v2z" /></svg:g>
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
export class KbqGripVerticalS16 extends KbqSvgIcon {}
