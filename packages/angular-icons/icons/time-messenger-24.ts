import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-time-messenger-24,[kbqTimeMessenger24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.41 6.212c2.488-3.18 7.59-1.4 7.59 2.64v6.286c0 4.049-5.102 5.827-7.59 2.655l-.062-.08-4.346-5.707 4.346-5.713zM0 8.858c0-4.039 5.101-5.82 7.59-2.64l.062.08 4.346 5.708-4.346 5.693-.062.08C5.1 20.956 0 19.178 0 15.137z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTimeMessenger24 extends KbqSvgIcon {}
