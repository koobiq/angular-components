import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSpeaker16]',
    template: `
        <svg:path
            d="M4.8 10.5h2.8l3.38 3.47c.063.064.17.019.17-.072V2.102c0-.09-.107-.136-.17-.072L7.6 5.5H4.8a1.2 1.2 0 0 0-1.2 1.2v2.6a1.2 1.2 0 0 0 1.2 1.2"
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
export class KbqSpeaker16 extends KbqSvgIcon {}
