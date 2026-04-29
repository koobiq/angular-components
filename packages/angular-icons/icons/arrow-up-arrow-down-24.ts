import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-arrow-down-24,[kbqArrowUpArrowDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.5 8.52a.304.304 0 0 0 0-.43L7.01 1.59a.303.303 0 0 0-.429 0L.09 8.09a.304.304 0 0 0 0 .43l1.286 1.288c.118.118.31.118.429 0l3.778-3.785v15.54c0 .168.136.304.303.304h1.819a.303.303 0 0 0 .303-.304V6.023l3.779 3.785c.118.118.31.118.428 0z"
                />
                <path
                    d="M10.5 15.48a.304.304 0 0 0 0 .43l6.491 6.501c.118.119.31.119.429 0l6.491-6.501a.304.304 0 0 0 0-.43l-1.286-1.287a.303.303 0 0 0-.429 0l-3.778 3.784V2.437a.303.303 0 0 0-.303-.304h-1.819a.303.303 0 0 0-.303.304v15.54l-3.779-3.784a.303.303 0 0 0-.428 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpArrowDown24 extends KbqSvgIcon {}
