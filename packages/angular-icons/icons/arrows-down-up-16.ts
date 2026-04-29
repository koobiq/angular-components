import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-down-up-16,[kbqArrowsDownUp16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M7.195 4.748 7.198.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v4.555l2.064-2.043a.2.2 0 0 1 .282 0l.798.79a.196.196 0 0 1 0 .279L8.14 7.542a.2.2 0 0 1-.282 0l-3.8-3.761a.196.196 0 0 1 0-.28l.797-.789a.2.2 0 0 1 .282 0zM8.805 11.252 8.802 15.8a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2v-4.555l-2.064 2.043a.2.2 0 0 1-.282 0l-.798-.79a.196.196 0 0 1 0-.279L7.86 8.458a.2.2 0 0 1 .282 0l3.8 3.761a.196.196 0 0 1 0 .28l-.797.789a.2.2 0 0 1-.282 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsDownUp16 extends KbqSvgIcon {}
