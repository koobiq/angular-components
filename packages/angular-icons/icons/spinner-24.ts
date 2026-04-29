import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-spinner-24,[kbqSpinner24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.9 19.483a8.1 8.1 0 1 0 3.3-15.58.204.204 0 0 1-.2-.203v-2c0-.11.09-.2.2-.198A10.5 10.5 0 1 1 1.502 12.2.197.197 0 0 1 1.7 12h2c.11 0 .2.09.202.2A8.1 8.1 0 0 0 8.9 19.483"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSpinner24 extends KbqSvgIcon {}
