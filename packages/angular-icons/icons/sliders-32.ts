import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sliders-32,[kbqSliders32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g>
                <path
                    d="M23 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0m-4-1h2v2h-2zM24.9 7a5 5 0 0 1 0 2H28V7zM15.1 7a5 5 0 0 0 0 2H4V7zM24.9 23H28v2h-3.1a5 5 0 0 0 0-2M15.1 23a5 5 0 0 0 0 2H4v-2zM28 15H16.9a5 5 0 0 1 0 2H28zM7 16q0-.514.1-1H4v2h3.1a5 5 0 0 1-.1-1M23 24a3 3 0 1 0-6 0 3 3 0 0 0 6 0m-4-1h2v2h-2zM12 13a3 3 0 1 1 0 6 3 3 0 0 1 0-6m1 2h-2v2h2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSliders32 extends KbqSvgIcon {}
