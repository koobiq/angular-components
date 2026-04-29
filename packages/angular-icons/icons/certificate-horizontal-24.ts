import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-certificate-horizontal-24,[kbqCertificateHorizontal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M24 4.671C24 3.748 23.194 3 22.2 3H1.8C.806 3 0 3.748 0 4.671V16.33C0 17.252.806 18 1.8 18h12.413a4.797 4.797 0 0 1 4.087-7.308 4.797 4.797 0 0 1 4.093 7.299c.9-.09 1.601-.794 1.607-1.652V4.671M3 7.497V6.299A.3.3 0 0 1 3.3 6h10.65a.3.3 0 0 1 .3.3v1.197a.3.3 0 0 1-.3.3H3.3a.3.3 0 0 1-.3-.3m0 3.742V10.04a.3.3 0 0 1 .3-.299h6.15a.3.3 0 0 1 .3.3v1.197a.3.3 0 0 1-.3.3H3.3a.3.3 0 0 1-.3-.3"
                />
                <path
                    d="M18.3 18.479a3 3 0 0 0 1.24-.267 3 3 0 0 0 1.76-2.727 2.997 2.997 0 0 0-3-2.993c-1.657 0-3 1.34-3 2.993a2.997 2.997 0 0 0 3 2.994M20.55 19.717a4.8 4.8 0 0 1-2.25.558 4.8 4.8 0 0 1-2.25-.558V23.7a.3.3 0 0 0 .466.25l1.784-1.187 1.784 1.186a.3.3 0 0 0 .466-.249z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCertificateHorizontal24 extends KbqSvgIcon {}
