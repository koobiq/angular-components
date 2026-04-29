import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-badge-arrow-through-line-o-16,[kbqFileBadgeArrowThroughLineO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M10.3 15.8v-1.88H8.7v1.88c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2M8.9 7.76a.2.2 0 0 0-.2.2v1.96h1.6V7.96a.2.2 0 0 0-.2-.2z"
                />
                <path
                    d="M3.8 14.4h3.7V16H3.2A1.2 1.2 0 0 1 2 14.8V1.2A1.2 1.2 0 0 1 3.2 0h6.717a.2.2 0 0 1 .142.059L13.94 3.94a.2.2 0 0 1 .059.142V9.26l-1.548-.967-.052-.031V5H9.2a.2.2 0 0 1-.2-.2V1.6H3.8a.2.2 0 0 0-.2.2v12.4c0 .11.09.2.2.2"
                />
                <path
                    d="M15.656 11.703a.2.2 0 0 1 .003.338l-3.833 2.479a.2.2 0 0 1-.31-.168V12.72H6.51v-1.6h5.007V9.48a.2.2 0 0 1 .306-.169z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileBadgeArrowThroughLineO16 extends KbqSvgIcon {}
