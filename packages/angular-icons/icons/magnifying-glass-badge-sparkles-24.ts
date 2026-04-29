import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-magnifying-glass-badge-sparkles-24,[kbqMagnifyingGlassBadgeSparkles24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.147 1.875q.797.002 1.551.148a6.4 6.4 0 0 0-1.4 2.257q-.075-.002-.151-.003a5.859 5.859 0 0 0 0 11.716 5.86 5.86 0 0 0 5.213-3.19q.48.075.982.076a6.4 6.4 0 0 0 1.67-.221c-.28.875-.7 1.687-1.237 2.408l5.274 5.272a.3.3 0 0 1 0 .425l-1.275 1.274a.3.3 0 0 1-.424 0l-5.274-5.273a8.26 8.26 0 1 1-4.93-14.889"
                />
                <path
                    d="M16.186 1.739c.094-.319.545-.319.638 0l.587 2.01c.254.869.934 1.549 1.803 1.803l2.01.587c.318.094.318.544 0 .637l-2.01.588c-.869.254-1.549.934-1.803 1.803l-.587 2.01c-.093.318-.544.318-.638 0l-.587-2.01a2.66 2.66 0 0 0-1.803-1.803l-2.01-.588c-.318-.093-.318-.544 0-.637l2.01-.587a2.66 2.66 0 0 0 1.803-1.803z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMagnifyingGlassBadgeSparkles24 extends KbqSvgIcon {}
