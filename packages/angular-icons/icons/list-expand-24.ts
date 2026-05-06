import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListExpand24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.546 6.6a.299.299 0 0 0 .254.457h2.384v3.448a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V7.057h2.384c.236 0 .38-.259.254-.457L5.64.89a.3.3 0 0 0-.51 0zM22.5 5.149a.3.3 0 0 1-.3.3h-9.753a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM22.5 12.949a.3.3 0 0 1-.3.3H9.3a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h12.9a.3.3 0 0 1 .3.3zM22.2 21.049a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-9.75a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3zM6.584 16.944v-3.449a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v3.449H1.801a.299.299 0 0 0-.255.457L5.13 23.11a.3.3 0 0 0 .509 0l3.583-5.71a.299.299 0 0 0-.254-.456z"
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
export class KbqListExpand24 extends KbqSvgIcon {}
