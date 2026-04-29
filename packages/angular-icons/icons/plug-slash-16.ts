import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-plug-slash-16,[kbqPlugSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1.41.559a.2.2 0 0 1 .282 0l3.34 3.338L6.878 2.05a.2.2 0 0 1 .283 0l.99.99 1.98-1.98a.2.2 0 0 1 .282 0l.849.848a.2.2 0 0 1 0 .283l-1.98 1.98 2.546 2.546 1.98-1.98a.2.2 0 0 1 .283 0l.848.849a.2.2 0 0 1 0 .282l-1.98 1.98.99.99a.2.2 0 0 1 0 .283l-1.848 1.847 3.34 3.34a.2.2 0 0 1 0 .283l-.851.85a.2.2 0 0 1-.283 0l-.387-.386h.002L.943 2.075H.941L.56 1.692a.2.2 0 0 1 0-.283zM9.82 12.652a5 5 0 0 1-3.225.148l-1.423 1.423L4.04 13.09l-1.854 1.854a.2.2 0 0 1-.284 0l-.847-.848a.2.2 0 0 1 0-.283l1.854-1.854-1.132-1.132L3.2 9.405a5 5 0 0 1 .146-3.227z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlugSlash16 extends KbqSvgIcon {}
