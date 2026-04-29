import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-split-screen-bottom-24,[kbqSplitScreenBottom24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.5 4.8A1.8 1.8 0 0 1 3.3 3h17.4a1.8 1.8 0 0 1 1.8 1.8v14.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8zm2.7 8.7h15.6a.3.3 0 0 0 .3-.3V5.7a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3v7.5a.3.3 0 0 0 .3.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSplitScreenBottom24 extends KbqSvgIcon {}
