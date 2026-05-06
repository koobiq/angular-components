import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileTextO24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.2 12a.3.3 0 0 0 .3.3h9a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-9a.3.3 0 0 0-.3.3zM16.8 15.6a.3.3 0 0 1-.3.3h-9a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h9a.3.3 0 0 1 .3.3zM7.2 19.2a.3.3 0 0 0 .3.3h4.2a.3.3 0 0 0 .3-.3V18a.3.3 0 0 0-.3-.3H7.5a.3.3 0 0 0-.3.3z"
            />
            <svg:path
                d="M21 6.124a.3.3 0 0 0-.088-.212L15.088.088A.3.3 0 0 0 14.876 0H4.8A1.8 1.8 0 0 0 3 1.8v20.4A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8zM5.4 2.7a.3.3 0 0 1 .3-.3h7.8v4.8a.3.3 0 0 0 .3.3h4.8v13.8a.3.3 0 0 1-.3.3H5.7a.3.3 0 0 1-.3-.3z"
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
export class KbqFileTextO24 extends KbqSvgIcon {}
