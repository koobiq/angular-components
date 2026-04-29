import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grip-vertical-s-16,[kbqGripVerticalS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g><path d="M5 3v2h2V3zM5 7v2h2V7zM5 11v2h2v-2zM9 11v2h2v-2zM9 9V7h2v2zM9 5V3h2v2z" /></g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGripVerticalS16 extends KbqSvgIcon {}
