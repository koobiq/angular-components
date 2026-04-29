import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-workflow-16,[kbqWorkflow16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 2.2A1.2 1.2 0 0 1 2.2 1h3.6A1.2 1.2 0 0 1 7 2.2v3.6A1.2 1.2 0 0 1 5.8 7h-1v3.8c0 .22.179.4.4.4H9v-1A1.2 1.2 0 0 1 10.2 9h3.6a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 0 1-1.2 1.2h-3.6A1.2 1.2 0 0 1 9 13.8v-1H5.2a2 2 0 0 1-2-2V7h-1A1.2 1.2 0 0 1 1 5.8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqWorkflow16 extends KbqSvgIcon {}
