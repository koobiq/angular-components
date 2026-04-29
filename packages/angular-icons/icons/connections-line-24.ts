import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-connections-line-24,[kbqConnectionsLine24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M4.5 7.5a3 3 0 0 0 2.75-1.8h9.5a3 3 0 1 0 0-2.4h-9.5A3 3 0 1 0 4.5 7.5M7.25 20.7a3 3 0 1 1 0-2.4h9.5a3 3 0 1 1 0 2.4z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqConnectionsLine24 extends KbqSvgIcon {}
