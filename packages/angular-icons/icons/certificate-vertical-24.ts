import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCertificateVertical24]',
    template: `
        <svg:g>
            <svg:path
                d="M3 1.8A1.8 1.8 0 0 1 4.8 0h14.4A1.8 1.8 0 0 1 21 1.8v5.82a6.6 6.6 0 0 0-8.1 10.07V24H4.8A1.8 1.8 0 0 1 3 22.2zM6 6a.3.3 0 0 0 .3.3h5.4A.3.3 0 0 0 12 6V4.8a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3z"
            />
            <svg:path
                d="M18 9c1.153 0 2.204.433 3 1.146a4.5 4.5 0 0 1 1.5 3.354 4.49 4.49 0 0 1-2.365 3.963l.044-.025a4.5 4.5 0 1 1-2.716-8.406M18 9q-.272 0-.537.032zM15 24l2.927-1.693c.046-.02.1-.02.146 0L21 24v-4.942a6.26 6.26 0 0 1-3 .759q-.458 0-.9-.064a6.3 6.3 0 0 1-2.1-.695z"
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
export class KbqCertificateVertical24 extends KbqSvgIcon {}
