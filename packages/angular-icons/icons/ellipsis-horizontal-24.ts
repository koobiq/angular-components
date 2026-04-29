import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ellipsis-horizontal-24,[kbqEllipsisHorizontal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M20.25 14.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5M12 14.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5M1.5 12A2.25 2.25 0 1 0 6 12a2.25 2.25 0 0 0-4.5 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEllipsisHorizontal24 extends KbqSvgIcon {}
