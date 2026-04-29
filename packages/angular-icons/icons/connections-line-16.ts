import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-connections-line-16,[kbqConnectionsLine16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3 5a2 2 0 0 0 1.834-1.2h6.332a2 2 0 1 0 0-1.6H4.834A2 2 0 1 0 3 5M4.834 13.8a2 2 0 1 1 0-1.6h6.332a2 2 0 1 1 0 1.6z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqConnectionsLine16 extends KbqSvgIcon {}
