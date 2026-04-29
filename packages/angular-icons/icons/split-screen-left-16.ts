import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-split-screen-left-16,[kbqSplitScreenLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 12.8A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V3.2A1.2 1.2 0 0 0 13.8 2H2.2A1.2 1.2 0 0 0 1 3.2zm5.2-.4a.2.2 0 0 1-.2-.2V3.8c0-.11.09-.2.2-.2h7c.11 0 .2.09.2.2v8.4a.2.2 0 0 1-.2.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSplitScreenLeft16 extends KbqSvgIcon {}
