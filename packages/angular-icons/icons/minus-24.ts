import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMinus24]',
    template: `
        <svg:path d="M21 12.9v-1.8a.3.3 0 0 0-.3-.3H3.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h17.4a.3.3 0 0 0 .3-.3" />
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
export class KbqMinus24 extends KbqSvgIcon {}
