import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-turn-down-left-24,[kbqArrowTurnDownLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M18.583 3.3c0-.165.135-.3.302-.3h1.813c.167 0 .302.135.302.3v12.618c0 .166-.135.3-.302.3H7.502l3.766 3.745a.3.3 0 0 1 0 .424l-1.282 1.275a.303.303 0 0 1-.427 0l-6.47-6.433a.3.3 0 0 1 0-.425l6.47-6.433a.303.303 0 0 1 .427 0l1.282 1.275a.3.3 0 0 1 0 .424l-3.766 3.745h11.08z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowTurnDownLeft24 extends KbqSvgIcon {}
