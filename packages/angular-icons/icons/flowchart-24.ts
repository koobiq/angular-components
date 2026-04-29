import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-flowchart-24,[kbqFlowchart24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M19.5 7.5a3 3 0 1 0-2.75-4.2H10.8a.3.3 0 0 0-.3.3v7.2H7.25a3 3 0 1 0 0 2.4h3.25v7.2a.3.3 0 0 0 .3.3h5.95a3 3 0 1 0 0-2.4H12.9V5.7h3.85a3 3 0 0 0 2.75 1.8"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFlowchart24 extends KbqSvgIcon {}
