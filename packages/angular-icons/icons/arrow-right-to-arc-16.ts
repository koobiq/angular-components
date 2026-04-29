import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-arc-16,[kbqArrowRightToArc16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M15 8.003c0 3.8-3.026 6.893-6.8 7a.196.196 0 0 1-.2-.198v-1.2c0-.11.09-.2.2-.204a5.4 5.4 0 0 0 5.2-5.398 5.4 5.4 0 0 0-5.2-5.399A.206.206 0 0 1 8 2.4V1.2c0-.11.09-.2.2-.197 3.774.106 6.8 3.2 6.8 7"
                />
                <path
                    d="m8.176 8.803-2.462 2.494a.2.2 0 0 0 0 .282l.836.847a.2.2 0 0 0 .285 0l4.226-4.283a.2.2 0 0 0 0-.281L6.835 3.579a.2.2 0 0 0-.285 0l-.836.847a.2.2 0 0 0 0 .281l2.462 2.495H1.2a.2.2 0 0 0-.2.2v1.2c0 .111.09.2.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToArc16 extends KbqSvgIcon {}
