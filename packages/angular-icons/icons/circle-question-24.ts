import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-question-24,[kbqCircleQuestion24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5m1.33-5.977a1.33 1.33 0 1 1-2.66 0 1.33 1.33 0 0 1 2.66 0m-2.448-2.61v-.227c.005-1.92.52-2.506 1.442-3.087.674-.428 1.195-.905 1.195-1.623 0-.763-.597-1.256-1.338-1.256-.637 0-1.23.375-1.38 1.084-.033.158-.162.287-.324.287h-1.64a.285.285 0 0 1-.29-.307c.188-1.984 1.75-2.928 3.645-2.928 2.177 0 3.724 1.118 3.724 3.037 0 1.29-.67 2.095-1.695 2.704-.866.52-1.25 1.02-1.261 2.09v.225a.3.3 0 0 1-.3.3h-1.478a.3.3 0 0 1-.3-.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleQuestion24 extends KbqSvgIcon {}
