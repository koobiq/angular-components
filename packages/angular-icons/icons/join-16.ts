import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-join-16,[kbqJoin16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16">
            <path
                d="M1.2 1a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h3.298L7.111 8l-2.613 5.4H1.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h3.55a1.2 1.2 0 0 0 1.08-.677L8.501 8.8h2.648v2.254c0 .158.182.251.315.16l4.45-3.053a.194.194 0 0 0 0-.322l-4.45-3.053c-.133-.091-.315.002-.315.16V7.2H8.502L5.829 1.677A1.2 1.2 0 0 0 4.75 1z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqJoin16 extends KbqSvgIcon {}
