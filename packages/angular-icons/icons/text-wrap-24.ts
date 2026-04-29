import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-wrap-24,[kbqTextWrap24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M22.183 5.38a.3.3 0 0 0 .3-.3V3.3a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v1.78a.3.3 0 0 0 .3.3zM1.8 21.018l6.585-.014v-2.38l-6.585.013a.3.3 0 0 0-.3.3v1.78a.3.3 0 0 0 .3.3M16.5 23.402a.3.3 0 0 1-.458.252L10.325 20.1a.297.297 0 0 1 0-.505l5.717-3.555a.3.3 0 0 1 .458.253v2.33h.847a2.744 2.744 0 0 0 2.754-2.733 2.744 2.744 0 0 0-2.754-2.733H1.8a.3.3 0 0 1-.3-.3v-1.78a.3.3 0 0 1 .3-.3h15.547c2.846 0 5.153 2.289 5.153 5.113s-2.307 5.114-5.153 5.114H16.5z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextWrap24 extends KbqSvgIcon {}
