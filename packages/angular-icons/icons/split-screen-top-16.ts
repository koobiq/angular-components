import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-split-screen-top-16,[kbqSplitScreenTop16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M15 12.8V3.2A1.2 1.2 0 0 0 13.8 2H2.2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2M13.2 7c.11 0 .2.09.2.2v5a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2v-5c0-.11.09-.2.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSplitScreenTop16 extends KbqSvgIcon {}
