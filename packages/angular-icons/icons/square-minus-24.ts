import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSquareMinus24]',
    template: `
        <svg:path
            d="M3.3 1.5a1.8 1.8 0 0 0-1.8 1.8v17.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8zm14.4 11.4H6.3a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h11.4a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3"
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
export class KbqSquareMinus24 extends KbqSvgIcon {}
