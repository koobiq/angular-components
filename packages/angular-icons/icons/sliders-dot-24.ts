import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSlidersDot24]',
    template: `
        <svg:g>
            <svg:path
                d="M19.95 9.28q-.222.02-.45.02a4.8 4.8 0 0 1-1.95-.413V13.8H15.3a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h2.25v4.65a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-4.65h2.25a.3.3 0 0 0 .3-.3V14.1a.3.3 0 0 0-.3-.3h-2.25zM15.049 6.3c.176.434.413.836.701 1.197V9.75a.3.3 0 0 1-.3.3H13.2V22.2a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V10.05H8.55a.3.3 0 0 1-.3-.3V6.6a.3.3 0 0 1 .3-.3h2.25V1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v4.5zM6.15 22.5a.3.3 0 0 0 .3-.3v-2.7H8.7a.3.3 0 0 0 .3-.3v-3.15a.3.3 0 0 0-.3-.3H6.45V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v13.95H1.8a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h2.25v2.7a.3.3 0 0 0 .3.3z"
            />
        </svg:g>
        <svg:g fill="currentColor">
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
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
export class KbqSlidersDot24 extends KbqSvgIcon {}
