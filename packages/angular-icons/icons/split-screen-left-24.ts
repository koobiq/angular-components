import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSplitScreenLeft24]',
    template: `
        <svg:path
            d="M1.5 19.2A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 20.7 3H3.3a1.8 1.8 0 0 0-1.8 1.8zm7.8-.6a.3.3 0 0 1-.3-.3V5.7a.3.3 0 0 1 .3-.3h10.5a.3.3 0 0 1 .3.3v12.6a.3.3 0 0 1-.3.3z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqSplitScreenLeft24 extends KbqSvgIcon {}
