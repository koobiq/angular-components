import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pin-16,[kbqPin16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M9.322 1.615a1.204 1.204 0 0 1 1.9-.262l3.427 3.426a1.204 1.204 0 0 1-.262 1.901L10.98 8.59c.977 1.796.326 4.492-1.124 6.062a.19.19 0 0 1-.277.005c-.671-.67-3.553-3.539-3.557-3.543l-3.142 3.141a.2.2 0 0 1-.109.056l-1.157.189a.1.1 0 0 1-.114-.114l.19-1.157a.2.2 0 0 1 .055-.109l3.142-3.14-3.543-3.556a.19.19 0 0 1 .004-.276c1.57-1.45 4.267-2.102 6.064-1.126z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPin16 extends KbqSvgIcon {}
