import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-satellite-dish-16,[kbqSatelliteDish16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8 2.4c0 .11.09.2.2.204A5.4 5.4 0 0 1 13.396 7.8c.004.11.093.2.204.2h1.2c.11 0 .2-.09.197-.2A7.003 7.003 0 0 0 8.2 1.003.196.196 0 0 0 8 1.2zM6.502 7.912A1.5 1.5 0 1 1 8.089 9.5l3.943 3.943a.195.195 0 0 1-.024.299A7.002 7.002 0 0 1 2.26 3.992c.07-.1.212-.11.298-.024z"
                />
                <path
                    d="M9.033 5.506a2.7 2.7 0 0 0-.833-.199A.21.21 0 0 1 8 5.1V3.9c0-.11.09-.2.2-.195A4.3 4.3 0 0 1 12.295 7.8c.005.11-.085.2-.195.2h-1.2c-.11 0-.2-.09-.207-.2a2.7 2.7 0 0 0-1.66-2.294"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSatelliteDish16 extends KbqSvgIcon {}
