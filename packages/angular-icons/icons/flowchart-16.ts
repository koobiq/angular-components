import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-flowchart-16,[kbqFlowchart16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M13 5a2 2 0 1 0-1.834-2.8H7.2a.2.2 0 0 0-.2.2v4.8H4.834a2 2 0 1 0 0 1.6H7v4.8c0 .11.09.2.2.2h3.966a2 2 0 1 0 0-1.6H8.6V3.8h2.566A2 2 0 0 0 13 5"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFlowchart16 extends KbqSvgIcon {}
