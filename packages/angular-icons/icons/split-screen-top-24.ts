import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSplitScreenTop24]',
    template: `
        <svg:path
            d="M22.5 19.2V4.8A1.8 1.8 0 0 0 20.7 3H3.3a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8m-2.7-8.7a.3.3 0 0 1 .3.3v7.5a.3.3 0 0 1-.3.3H4.2a.3.3 0 0 1-.3-.3v-7.5a.3.3 0 0 1 .3-.3z"
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
export class KbqSplitScreenTop24 extends KbqSvgIcon {}
