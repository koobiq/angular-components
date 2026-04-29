import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-secret-16,[kbqUserSecret16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m12.767 2.484.735 4.116H14.8c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h1.298l.735-4.116A1.8 1.8 0 0 1 5.005 1h5.99a1.8 1.8 0 0 1 1.772 1.484M6.94 11.4a3.001 3.001 0 1 0 0 1.2h2.12a3.001 3.001 0 1 0 0-1.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserSecret16 extends KbqSvgIcon {}
