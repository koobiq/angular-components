import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSquarePlus24]',
    template: `
        <svg:path
            d="M3.3 1.5a1.8 1.8 0 0 0-1.8 1.8v17.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8zm7.89 16.414a.3.3 0 0 1-.09-.214v-4.8H6.3a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h4.8V6.3a.3.3 0 0 1 .16-.266A.3.3 0 0 1 11.4 6h1.2a.3.3 0 0 1 .3.3v4.8h4.8a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3h-4.8v4.8a.3.3 0 0 1-.3.3h-1.2a.3.3 0 0 1-.21-.086"
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
export class KbqSquarePlus24 extends KbqSvgIcon {}
