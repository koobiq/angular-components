import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ellipsis-vertical-16,[kbqEllipsisVertical16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M9.5 2.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEllipsisVertical16 extends KbqSvgIcon {}
