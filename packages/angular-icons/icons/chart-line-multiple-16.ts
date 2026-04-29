import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-line-multiple-16,[kbqChartLineMultiple16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.6 1.2a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v13.807h13.811a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H2.6z"
                />
                <path
                    d="M3.8 10.831V8.57L9.36 3.01a.2.2 0 0 1 .282 0l2.36 2.359 1.792-1.793a.2.2 0 0 1 .283 0l.848.848a.2.2 0 0 1 0 .283L12.142 7.49a.2.2 0 0 1-.283 0L9.5 5.13z"
                />
                <path
                    d="M4.565 12.203h2.263L9.5 9.531l2.358 2.359a.2.2 0 0 0 .283 0l2.783-2.783a.2.2 0 0 0 0-.283l-.848-.848a.2.2 0 0 0-.283 0L12 9.769 9.64 7.41a.2.2 0 0 0-.283 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartLineMultiple16 extends KbqSvgIcon {}
