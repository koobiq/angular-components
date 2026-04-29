import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pause-48,[kbqPause48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <g>
                <path
                    d="M19 9h-4c-1.105 0-2 .672-2 1.5v27c0 .828.895 1.5 2 1.5h4c1.105 0 2-.672 2-1.5v-27c0-.828-.895-1.5-2-1.5M33 9h-4c-1.105 0-2 .672-2 1.5v27c0 .828.895 1.5 2 1.5h4c1.105 0 2-.672 2-1.5v-27c0-.828-.895-1.5-2-1.5"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPause48 extends KbqSvgIcon {}
