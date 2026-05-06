import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRegistry24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.8 1.5a.3.3 0 0 0-.3.3v5.4a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3zM1.8 12a.3.3 0 0 0-.3.3v9.9a.3.3 0 0 0 .3.3h9.9a.3.3 0 0 0 .3-.3v-9.9a.3.3 0 0 0-.3-.3zM17.428 2.33a.3.3 0 0 1 .424 0l3.818 3.818a.3.3 0 0 1 0 .424l-3.822 3.823a.3.3 0 0 1-.424 0l-3.819-3.819a.3.3 0 0 1 0-.424zM16.8 16.5a.3.3 0 0 0-.3.3v5.4a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3v-5.4a.3.3 0 0 0-.3-.3z"
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
export class KbqRegistry24 extends KbqSvgIcon {}
