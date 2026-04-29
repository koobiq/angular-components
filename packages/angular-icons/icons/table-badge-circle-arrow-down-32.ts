import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-table-badge-circle-arrow-down-32,[kbqTableBadgeCircleArrowDown32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g>
                <path
                    d="M23 2H3a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h11.2q-.198-.97-.2-2v-4h.832A10 10 0 0 1 16 16H14v-4h4v2a10 10 0 0 1 2-1.168V12h4q1.03.002 2 .2V5a3 3 0 0 0-3-3M12 16H8v-4h4zm-4 2h4v4H8zm-2-2H2v-4h4zm-4 2h4v4H3a1 1 0 0 1-1-1zM24 5v5H2V5a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1"
                />
                <path
                    d="M32 22a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-7.982-4a1 1 0 0 0-1 1v4.183l-.878-.731a1 1 0 1 0-1.28 1.536l2.5 2.084a1 1 0 0 0 1.28 0l2.5-2.084a1 1 0 1 0-1.28-1.536l-.842.702V19a1 1 0 0 0-1-1"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTableBadgeCircleArrowDown32 extends KbqSvgIcon {}
