import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-left-24,[kbqArrowUpLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.627 6.919h7.467a.3.3 0 0 0 .302-.303V4.802a.3.3 0 0 0-.302-.302H4.8a.3.3 0 0 0-.302.302v11.294c0 .167.135.303.302.303h1.814a.3.3 0 0 0 .303-.303V8.63l11.457 11.457c.118.119.31.119.428 0l1.282-1.282a.3.3 0 0 0 0-.428z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpLeft24 extends KbqSvgIcon {}
