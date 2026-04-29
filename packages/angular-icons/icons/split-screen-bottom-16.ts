import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-split-screen-bottom-16,[kbqSplitScreenBottom16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 3.2A1.2 1.2 0 0 1 2.2 2h11.6A1.2 1.2 0 0 1 15 3.2v9.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 12.8zM2.8 9h10.4a.2.2 0 0 0 .2-.2v-5a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2v5c0 .11.09.2.2.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSplitScreenBottom16 extends KbqSvgIcon {}
