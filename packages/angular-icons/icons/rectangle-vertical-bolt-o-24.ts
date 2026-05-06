import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalBoltO24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.7 2.4h12.6a.3.3 0 0 1 .3.3v18.6a.3.3 0 0 1-.3.3H5.7a.3.3 0 0 1-.3-.3V2.7a.3.3 0 0 1 .3-.3M4.8 0A1.8 1.8 0 0 0 3 1.8v20.4A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 19.2 0z"
            />
            <svg:path
                d="M9.718 4.633c.021-.08.08-.133.146-.133h4.292c.108 0 .182.136.144.263l-1.663 5.572h3.709c.133 0 .203.2.114.324l-6.26 8.776c-.11.153-.309.014-.264-.184l1.36-5.999H7.653c-.105 0-.18-.13-.146-.256z"
            />
        </svg:g>
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
export class KbqRectangleVerticalBoltO24 extends KbqSvgIcon {}
