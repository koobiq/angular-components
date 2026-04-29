import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-minus-o-16,[kbqCircleMinusO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.542 7.4v1.2c0 .11-.29.2-.2.2h-6.68a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h6.68c-.09 0 .2.09.2.2"
                />
                <path d="M8 13.4A5.4 5.4 0 1 1 8 2.6a5.4 5.4 0 0 1 0 10.8M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleMinusO16 extends KbqSvgIcon {}
