import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-to-bracket-16,[kbqArrowUpToBracket16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 2.2v4.6c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-4c0-.11.09-.2.2-.2h10.4c-.39 0 .2.09.2.2v4c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2V2.2c0-.663-1.037-1.2-1.2-1.2H2.2A1.2 1.2 0 0 0 1 2.2"
                />
                <path
                    d="m7.2 7.824-2.494 2.462a.2.2 0 0 1-.28 0l-.847-.836a.2.2 0 0 1 0-.285l4.28-4.226a.2.2 0 0 1 .282 0l4.28 4.226a.2.2 0 0 1 0 .285l-.846.836a.2.2 0 0 1-.281 0L8.8 7.824V14.8a.2.2 0 0 1-.2.2H7.4a.2.2 0 0 1-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpToBracket16 extends KbqSvgIcon {}
