import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsLeftRightToLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M0 3.3A.3.3 0 0 1 .3 3h1.8a.3.3 0 0 1 .3.3v17.4a.3.3 0 0 1-.3.3H.3a.3.3 0 0 1-.3-.3zM21.6 3.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v17.4a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3zM15.84 7.68a.15.15 0 0 0-.24.12v3H8.4v-3a.15.15 0 0 0-.24-.12l-5.6 4.2a.15.15 0 0 0 0 .24l5.6 4.2a.15.15 0 0 0 .24-.12v-3h7.2v3a.15.15 0 0 0 .24.12l5.6-4.2a.15.15 0 0 0 0-.24z"
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
export class KbqArrowsLeftRightToLine24 extends KbqSvgIcon {}
