import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-building-24,[kbqBuilding24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.4 13.4c0-.11.09-.2.2-.2h5c.11 0 .2.09.2.2v6.5a.2.2 0 0 1-.2.2h-5a.2.2 0 0 1-.2-.2zm.2-2.6a.2.2 0 0 1-.2-.2V4.1c0-.11.09-.2.2-.2h5c.11 0 .2.09.2.2v6.5a.2.2 0 0 1-.2.2zm7.6-6.7c0-.11.09-.2.2-.2h5c.11 0 .2.09.2.2v6.5a.2.2 0 0 1-.2.2h-5a.2.2 0 0 1-.2-.2zm5.2 9.1c.11 0 .2.09.2.2v6.5a.2.2 0 0 1-.2.2h-5a.2.2 0 0 1-.2-.2v-6.5c0-.11.09-.2.2-.2zM4.8 1.5A1.8 1.8 0 0 0 3 3.3v16.8H1.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H21V3.3a1.8 1.8 0 0 0-1.8-1.8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBuilding24 extends KbqSvgIcon {}
