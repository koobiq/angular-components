import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-24,[kbqList24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M5.259 4.178a1.87 1.87 0 0 1-1.875 1.864 1.87 1.87 0 0 1-1.875-1.864c0-1.03.84-1.864 1.875-1.864a1.87 1.87 0 0 1 1.875 1.864M5.25 11.997a1.87 1.87 0 0 1-1.875 1.864A1.87 1.87 0 0 1 1.5 11.997c0-1.03.84-1.864 1.875-1.864a1.87 1.87 0 0 1 1.875 1.864M3.375 21.692a1.87 1.87 0 0 0 1.875-1.864 1.87 1.87 0 0 0-1.875-1.864A1.87 1.87 0 0 0 1.5 19.828c0 1.03.84 1.864 1.875 1.864M22.509 5.234a.3.3 0 0 1-.3.3H7.464a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.21a.3.3 0 0 1 .3.3zM22.5 12.897a.3.3 0 0 1-.3.3H7.456a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM7.156 20.728a.3.3 0 0 0 .3.3H22.2a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H7.456a.3.3 0 0 0-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqList24 extends KbqSvgIcon {}
