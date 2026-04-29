import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-16,[kbqArrowsRotate16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="m2.366 13.629-.275.275a.2.2 0 0 1-.336-.096L.848 9.875a.2.2 0 0 1 .24-.24l3.932.908a.2.2 0 0 1 .097.336l-.937.937a5.4 5.4 0 0 0 9.207-3.426.102.102 0 0 1 .123-.093l1.292.298a.196.196 0 0 1 .152.213 7.001 7.001 0 0 1-11.906 4.14zM13.633 2.377l.275-.276a.2.2 0 0 1 .336.097l.908 3.933a.2.2 0 0 1-.24.24l-3.933-.908a.2.2 0 0 1-.096-.336l.94-.94a5.4 5.4 0 0 0-9.21 3.424.102.102 0 0 1-.123.092l-1.292-.298a.196.196 0 0 1-.152-.213 7.001 7.001 0 0 1 11.909-4.137z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotate16 extends KbqSvgIcon {}
