import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grip-vertical-s-24,[kbqGripVerticalS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M7.5 4.5v3h3v-3zM7.5 10.5v3h3v-3zM7.5 16.5v3h3v-3zM13.5 16.5v3h3v-3zM13.5 13.5v-3h3v3zM13.5 7.5v-3h3v3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGripVerticalS24 extends KbqSvgIcon {}
