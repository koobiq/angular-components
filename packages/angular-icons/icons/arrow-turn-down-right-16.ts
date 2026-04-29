import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-turn-down-right-16,[kbqArrowTurnDownRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.612 2.2A.2.2 0 0 0 3.41 2H2.201A.2.2 0 0 0 2 2.2v8.412c0 .11.09.2.201.2H11l-2.511 2.496a.2.2 0 0 0 0 .284l.854.85a.2.2 0 0 0 .285 0l4.314-4.29a.2.2 0 0 0 0-.283L9.627 5.581a.2.2 0 0 0-.285 0l-.854.85a.2.2 0 0 0 0 .283l2.51 2.496H3.613z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowTurnDownRight16 extends KbqSvgIcon {}
