import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-message-faq-24,[kbqMessageFaq24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M18.255 12.023H17.08l.837 1.106a2 2 0 0 1-.358.035c-1.006 0-1.662-.75-1.662-2.138s.656-2.138 1.662-2.138c1.004 0 1.662.751 1.662 2.138 0 .713-.175 1.26-.479 1.62zM9.97 11.726h1.661l-.805-2.477h-.051z"
                />
                <path
                    d="M1.5 6.6A3.6 3.6 0 0 1 5.1 3h13.8a3.6 3.6 0 0 1 3.6 3.6v9.3a3.6 3.6 0 0 1-3.6 3.6h-7.28l-5.133 4.106A.3.3 0 0 1 6 23.372V19.5h-.9a3.6 3.6 0 0 1-3.6-3.6zm18.83 7.993-.742-.933c.64-.572 1.035-1.467 1.035-2.634 0-2.141-1.33-3.362-3.065-3.362-1.745 0-3.065 1.22-3.065 3.362 0 2.132 1.32 3.363 3.065 3.363.41 0 .796-.068 1.148-.202l.437.538a.3.3 0 0 0 .233.11h.837a.15.15 0 0 0 .118-.243m-11.416-.294a.3.3 0 0 0 .285-.207l.419-1.286h2.362l.418 1.286a.3.3 0 0 0 .285.207h1.055a.15.15 0 0 0 .142-.199l-2.118-6.144a.3.3 0 0 0-.284-.202h-1.356a.3.3 0 0 0-.283.202L7.718 14.1a.15.15 0 0 0 .141.199zM3.676 7.754a.3.3 0 0 0-.3.3v5.945a.3.3 0 0 0 .3.3h.784a.3.3 0 0 0 .3-.3v-2.404h2.363a.3.3 0 0 0 .3-.3v-.54a.3.3 0 0 0-.3-.3H4.76v-1.56h2.65a.3.3 0 0 0 .3-.3v-.541a.3.3 0 0 0-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMessageFaq24 extends KbqSvgIcon {}
