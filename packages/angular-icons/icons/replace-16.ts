import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-replace-16,[kbqReplace16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.7 6.506A5.51 5.51 0 0 1 13.378 4.59h1.492a.2.2 0 0 1 .168.305l-2.37 3.811a.198.198 0 0 1-.336 0l-2.37-3.811a.2.2 0 0 1 .168-.305h1.49A3.91 3.91 0 0 0 4.3 6.506V8.8H2.7zM1.133 10a.133.133 0 0 0-.133.133v4.734c0 .073.06.133.133.133h4.734c.073 0 .133-.06.133-.133v-4.734A.133.133 0 0 0 5.867 10zM10.133 10a.133.133 0 0 0-.133.133v4.734c0 .073.06.133.133.133h4.734c.073 0 .133-.06.133-.133v-4.734a.133.133 0 0 0-.133-.133z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqReplace16 extends KbqSvgIcon {}
