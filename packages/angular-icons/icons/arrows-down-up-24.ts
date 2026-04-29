import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-down-up-24,[kbqArrowsDownUp24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.792 7.121 10.798.3a.3.3 0 0 1 .3-.3h1.799a.3.3 0 0 1 .3.3v6.832l3.096-3.064a.3.3 0 0 1 .423 0l1.196 1.185a.294.294 0 0 1 0 .418l-5.7 5.642a.3.3 0 0 1-.423 0L6.088 5.671a.294.294 0 0 1 0-.418l1.196-1.185a.3.3 0 0 1 .423 0zM13.208 16.879l-.006 6.821a.3.3 0 0 1-.3.3h-1.799a.3.3 0 0 1-.3-.3v-6.832l-3.096 3.064a.3.3 0 0 1-.423 0l-1.196-1.185a.294.294 0 0 1 0-.418l5.7-5.642a.3.3 0 0 1 .423 0l5.701 5.642a.294.294 0 0 1 0 .418l-1.196 1.185a.3.3 0 0 1-.423 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsDownUp24 extends KbqSvgIcon {}
