import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-unit-24,[kbqUnit24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.88 10.8h4.32a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3h-4.32a6.002 6.002 0 0 1-11.76 0H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h4.32a6.002 6.002 0 0 1 11.76 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUnit24 extends KbqSvgIcon {}
