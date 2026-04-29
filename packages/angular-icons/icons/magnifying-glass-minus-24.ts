import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-magnifying-glass-minus-24,[kbqMagnifyingGlassMinus24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.575 11.025a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3H6.75a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3z"
                />
                <path
                    d="M10.142 18.396a8.22 8.22 0 0 0 4.93-1.632l5.272 5.273a.3.3 0 0 0 .425 0l1.274-1.274a.3.3 0 0 0 0-.425l-5.273-5.273a8.26 8.26 0 1 0-6.629 3.33m0-2.403a5.857 5.857 0 1 1 0-11.715 5.857 5.857 0 0 1 0 11.715"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMagnifyingGlassMinus24 extends KbqSvgIcon {}
