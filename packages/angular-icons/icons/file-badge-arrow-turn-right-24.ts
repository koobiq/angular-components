import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-badge-arrow-turn-right-24,[kbqFileBadgeArrowTurnRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M18.6 7.5v13.8a.3.3 0 0 1-.3.3H6V24h13.2a1.8 1.8 0 0 0 1.8-1.8V6.124a.3.3 0 0 0-.088-.212L15.088.088A.3.3 0 0 0 14.876 0H4.8A1.8 1.8 0 0 0 3 1.8v11.224a4.8 4.8 0 0 1 1.8-.35h.6V2.7a.3.3 0 0 1 .3-.3h7.8v4.8a.3.3 0 0 0 .3.3z"
                />
                <path
                    d="M2.1 21.75a.3.3 0 0 1-.3-.3v-3.975a3 3 0 0 1 3-3h2.4V12.09a.3.3 0 0 1 .46-.254l5.733 3.584a.3.3 0 0 1 0 .508L7.66 19.513a.3.3 0 0 1-.459-.254v-2.384H4.8a.6.6 0 0 0-.6.6v3.975a.3.3 0 0 1-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileBadgeArrowTurnRight24 extends KbqSvgIcon {}
