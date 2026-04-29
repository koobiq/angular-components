import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-right-24,[kbqArrowUpRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M15.37 6.919H7.905a.3.3 0 0 1-.302-.303V4.802c0-.167.135-.302.302-.302h11.294c.167 0 .302.135.302.302v11.294a.3.3 0 0 1-.302.303h-1.814a.3.3 0 0 1-.303-.303V8.63L5.624 20.086a.3.3 0 0 1-.428 0l-1.282-1.282a.3.3 0 0 1 0-.428z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpRight24 extends KbqSvgIcon {}
