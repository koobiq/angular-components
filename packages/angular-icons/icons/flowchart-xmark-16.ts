import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-flowchart-xmark-16,[kbqFlowchartXmark16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M10.49 1.638a.2.2 0 0 1 0-.282l.849-.849a.2.2 0 0 1 .282 0l1.362 1.362L14.346.506a.2.2 0 0 1 .283 0l.848.848a.2.2 0 0 1 0 .283L14.114 3l1.362 1.361a.2.2 0 0 1 0 .283l-.849.849a.2.2 0 0 1-.282 0L12.983 4.13l-1.36 1.36a.2.2 0 0 1-.284.002l-.849-.849a.2.2 0 0 1 .002-.284L11.852 3z"
                />
                <path
                    d="M9.85 2.2H7.2a.2.2 0 0 0-.2.2v4.8H5v-2a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v5.6c0 .11.09.2.2.2h3.6a.2.2 0 0 0 .2-.2v-2h2v4.8c0 .11.09.2.2.2H11v1c0 .11.09.2.2.2h3.6a.2.2 0 0 0 .2-.2v-3.6a.2.2 0 0 0-.2-.2h-3.6a.2.2 0 0 0-.2.2v1H8.6V3.8h1.25l.8-.8z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFlowchartXmark16 extends KbqSvgIcon {}
