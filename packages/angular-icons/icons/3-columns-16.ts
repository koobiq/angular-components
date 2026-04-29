import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-3-columns-16,[kbq3Columns16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M13.8 1A1.2 1.2 0 0 1 15 2.2v11.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V2.2A1.2 1.2 0 0 1 2.2 1zM6.73 13.4h2.54V2.6H6.73zm4.14 0h2.33a.2.2 0 0 0 .2-.2V2.8a.2.2 0 0 0-.2-.2h-2.33zM2.8 2.6a.2.2 0 0 0-.2.2v10.4c0 .11.09.2.2.2h2.33V2.6z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Kbq3Columns16 extends KbqSvgIcon {}
