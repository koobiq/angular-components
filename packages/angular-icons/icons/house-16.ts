import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-house-16,[kbqHouse16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.419 6.64A1.2 1.2 0 0 0 1 7.553V14.8c0 .11.09.2.2.2h4.1a.2.2 0 0 0 .2-.2v-4.1c0-.11.09-.2.2-.2h4.6c.11 0 .2.09.2.2v4.1c0 .11.09.2.2.2h4.1a.2.2 0 0 0 .2-.2V7.552a1.2 1.2 0 0 0-.42-.911L8.13 1.11a.2.2 0 0 0-.26 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHouse16 extends KbqSvgIcon {}
