import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-swords-16,[kbqSwords16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.567 3.337a.2.2 0 0 1-.057.12l-3.557 3.6-2.11-2.135 3.558-3.602a.2.2 0 0 1 .117-.058l2.197-.261a.1.1 0 0 1 .11.111zM12.973 10.811l.914-.925a.197.197 0 0 1 .281 0l.563.57a.203.203 0 0 1 0 .284l-1.407 1.424 1.618 1.638a.203.203 0 0 1 0 .285l-.844.854a.197.197 0 0 1-.281 0l-1.618-1.638-1.406 1.424a.197.197 0 0 1-.281 0l-.563-.57a.203.203 0 0 1 0-.284l.914-.926-9.373-9.49a.2.2 0 0 1-.057-.12l-.259-2.225a.1.1 0 0 1 .11-.111l2.198.261a.2.2 0 0 1 .117.058zM5.047 8.766l2.11 2.137-2.02 2.044.914.926a.203.203 0 0 1 0 .285l-.563.57a.197.197 0 0 1-.281 0l-1.406-1.425-1.618 1.638a.197.197 0 0 1-.28 0l-.845-.854a.203.203 0 0 1 0-.285l1.618-1.638-1.407-1.424a.203.203 0 0 1 0-.285l.563-.57a.197.197 0 0 1 .281 0l.914.926z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSwords16 extends KbqSvgIcon {}
