import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-building-16,[kbqBuilding16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.6 9c0-.11.09-.2.2-.2H7c.11 0 .2.09.2.2v4.2a.2.2 0 0 1-.2.2H3.8a.2.2 0 0 1-.2-.2zm.2-1.8a.2.2 0 0 1-.2-.2V2.8c0-.11.09-.2.2-.2H7c.11 0 .2.09.2.2V7a.2.2 0 0 1-.2.2zm5-4.4c0-.11.09-.2.2-.2h3.2c.11 0 .2.09.2.2V7a.2.2 0 0 1-.2.2H9a.2.2 0 0 1-.2-.2zm3.4 6c.11 0 .2.09.2.2v4.2a.2.2 0 0 1-.2.2H9a.2.2 0 0 1-.2-.2V9c0-.11.09-.2.2-.2zM3.2 1A1.2 1.2 0 0 0 2 2.2v11.2h-.8a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H14V2.2A1.2 1.2 0 0 0 12.8 1z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBuilding16 extends KbqSvgIcon {}
