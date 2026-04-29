import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-turn-down-left-16,[kbqArrowTurnDownLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M12.389 2.2c0-.11.09-.2.2-.2h1.21a.2.2 0 0 1 .201.2v8.412a.2.2 0 0 1-.201.2H5l2.511 2.496a.2.2 0 0 1 0 .284l-.854.85a.2.2 0 0 1-.285 0l-4.314-4.29a.2.2 0 0 1 0-.283l4.314-4.288a.2.2 0 0 1 .285 0l.854.85a.2.2 0 0 1 0 .283L5.002 9.21h7.387z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowTurnDownLeft16 extends KbqSvgIcon {}
