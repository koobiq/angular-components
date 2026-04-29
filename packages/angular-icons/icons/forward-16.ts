import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-forward-16,[kbqForward16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M15 3.2a.2.2 0 0 0-.2-.2h-1.6a.2.2 0 0 0-.2.2v9.6c0 .11.09.2.2.2h1.6a.2.2 0 0 0 .2-.2zM6.645 7.848a.2.2 0 0 1 0 .304l-5.315 4.56a.2.2 0 0 1-.33-.153V3.441a.2.2 0 0 1 .33-.152zM12.645 7.848a.2.2 0 0 1 0 .304l-5.315 4.56a.2.2 0 0 1-.33-.153V3.441a.2.2 0 0 1 .33-.152z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqForward16 extends KbqSvgIcon {}
