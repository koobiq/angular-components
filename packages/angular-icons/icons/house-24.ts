import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-house-24,[kbqHouse24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.919 10.14a1.2 1.2 0 0 0-.419.912V22.3c0 .11.09.2.2.2h6.35a.2.2 0 0 0 .2-.2v-6.35c0-.11.09-.2.2-.2h7.1c.11 0 .2.09.2.2v6.35c0 .11.09.2.2.2h6.35a.2.2 0 0 0 .2-.2V11.052a1.2 1.2 0 0 0-.42-.911l-9.95-8.53a.2.2 0 0 0-.26 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHouse24 extends KbqSvgIcon {}
