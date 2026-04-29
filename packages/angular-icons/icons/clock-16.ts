import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clock-16,[kbqClock16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8.8 9a.2.2 0 0 0 .2-.2V4.4a.2.2 0 0 0-.2-.2H7.6a.2.2 0 0 0-.2.2v3H4.667a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2z"
                />
                <path d="M8 13.4A5.4 5.4 0 1 1 8 2.6a5.4 5.4 0 0 1 0 10.8M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClock16 extends KbqSvgIcon {}
