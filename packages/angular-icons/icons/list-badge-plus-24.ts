import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListBadgePlus24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.25 3.364a1.87 1.87 0 0 1-1.875 1.864A1.87 1.87 0 0 1 1.5 3.364c0-1.03.84-1.864 1.875-1.864A1.87 1.87 0 0 1 5.25 3.364M5.25 11.17a1.87 1.87 0 0 1-1.875 1.864A1.87 1.87 0 0 1 1.5 11.17c0-1.03.84-1.864 1.875-1.864A1.87 1.87 0 0 1 5.25 11.17M3.375 21a1.87 1.87 0 0 0 1.875-1.864 1.87 1.87 0 0 0-1.875-1.864A1.87 1.87 0 0 0 1.5 19.136c0 1.03.84 1.864 1.875 1.864M22.5 4.42a.3.3 0 0 1-.3.3H7.456a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM22.5 12.07a.3.3 0 0 1-.3.3H7.456a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM7.156 20.036a.3.3 0 0 0 .3.3H12.9a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H7.456a.3.3 0 0 0-.3.3zM19.012 14.55a.3.3 0 0 0-.3.3v3.411H15.3a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h3.412v3.19a.3.3 0 0 0 .3.3h1.2a.3.3 0 0 0 .3-.3v-3.19H23.7a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-3.188V14.85a.3.3 0 0 0-.3-.3z"
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
export class KbqListBadgePlus24 extends KbqSvgIcon {}
