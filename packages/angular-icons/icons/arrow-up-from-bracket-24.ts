import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-from-bracket-24,[kbqArrowUpFromBracket24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m13.2 5.94 3.741 3.714a.3.3 0 0 0 .422 0l1.27-1.26a.303.303 0 0 0 0-.43L12.21 1.587a.3.3 0 0 0-.421 0L5.368 7.964a.303.303 0 0 0 0 .43l1.27 1.26a.3.3 0 0 0 .422 0L10.8 5.94v10.525a.3.3 0 0 0 .3.302h1.8a.3.3 0 0 0 .3-.302z"
                />
                <path
                    d="M1.5 20.69v-6.94a.3.3 0 0 1 .3-.302h1.8a.3.3 0 0 1 .3.301v6.337h16.2v-6.337a.3.3 0 0 1 .3-.301h1.8a.3.3 0 0 1 .3.301v6.94c0 1-.806 1.811-1.8 1.811H3.3c-.994 0-1.8-.81-1.8-1.81"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpFromBracket24 extends KbqSvgIcon {}
