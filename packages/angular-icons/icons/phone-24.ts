import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-phone-24,[kbqPhone24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.547 15.293a.3.3 0 0 0-.318.114c-.87 1.208-1.274 1.8-1.784 2.513-3.667-1.574-6.794-4.706-8.365-8.366.714-.51 1.305-.915 2.513-1.784a.3.3 0 0 0 .114-.318C8.208 5.577 7.683 3.58 7.067 1.5H3.793C1.5 1.5 1.5 3.35 1.5 4.207c0 9.626 8.657 18.293 18.292 18.293.857 0 2.707 0 2.707-2.293v-3.052a.3.3 0 0 0-.213-.285c-2.003-.59-3.928-1.095-5.739-1.577"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPhone24 extends KbqSvgIcon {}
