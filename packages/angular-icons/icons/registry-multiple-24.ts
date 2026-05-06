import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRegistryMultiple24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 1.8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 13.8a.3.3 0 0 1 .3-.3h8.4a.3.3 0 0 1 .3.3v8.4a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM17.428 2.33a.3.3 0 0 1 .424 0l3.818 3.818a.3.3 0 0 1 0 .424l-3.822 3.823a.3.3 0 0 1-.424 0l-3.819-3.819a.3.3 0 0 1 0-.424zM16.5 16.8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 1-.3.3h-5.4a.3.3 0 0 1-.3-.3z"
            />
            <svg:path
                d="M4.5 11.7h7.6c.11 0 .2.09.2.2v7.6a.3.3 0 0 0 .3.3h1.2a.3.3 0 0 0 .3-.3v-9.3a.3.3 0 0 0-.3-.3H4.5a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3"
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
export class KbqRegistryMultiple24 extends KbqSvgIcon {}
