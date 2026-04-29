import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-check-badge-auto-16,[kbqCheckBadgeAuto16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M6.147 10.548a.197.197 0 0 0 .28 0l7.045-7.106a.2.2 0 0 0 0-.284l-.842-.85a.197.197 0 0 0-.281 0L6.287 8.424 2.931 5.038a.197.197 0 0 0-.28 0l-.843.85a.2.2 0 0 0 0 .283zM14.237 13.48a.2.2 0 0 1-.186.27h-.878a.2.2 0 0 1-.189-.137l-.37-1.129h-2.148l-.361 1.127a.2.2 0 0 1-.19.139h-.877a.2.2 0 0 1-.186-.27l2.07-5.609a.2.2 0 0 1 .186-.13h.865c.082 0 .157.052.186.13zm-2.692-4.295-.76 2.327h1.51z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheckBadgeAuto16 extends KbqSvgIcon {}
