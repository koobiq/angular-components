import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-badge-arrow-through-line-o-24,[kbqFileBadgeArrowThroughLineO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M15.45 23.7v-2.82h-2.4v2.82a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3M13.35 11.64a.3.3 0 0 0-.3.3v2.94h2.4v-2.94a.3.3 0 0 0-.3-.3z"
                />
                <path
                    d="M5.7 21.6h5.55V24H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0h10.076a.3.3 0 0 1 .212.088l5.824 5.824a.3.3 0 0 1 .088.212v7.768l-2.322-1.451-.078-.047V7.5h-4.8a.3.3 0 0 1-.3-.3V2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3"
                />
                <path
                    d="M23.484 17.555a.3.3 0 0 1 .004.506l-5.75 3.719a.3.3 0 0 1-.463-.252V19.08h-7.51v-2.4h7.51v-2.459a.3.3 0 0 1 .46-.254z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileBadgeArrowThroughLineO24 extends KbqSvgIcon {}
