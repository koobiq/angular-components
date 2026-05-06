import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlay24]',
    template: `
        <svg:path
            d="M19.359 11.758a.278.278 0 0 1 0 .484l-12.92 7.967c-.193.113-.439-.022-.439-.242V4.033c0-.22.246-.355.44-.242z"
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
export class KbqPlay24 extends KbqSvgIcon {}
