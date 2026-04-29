import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-double-down-16,[kbqChevronDoubleDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="m8 6.78 4.809-4.722a.203.203 0 0 1 .285 0l.845.83c.081.08.081.21 0 .29L8.142 8.87a.203.203 0 0 1-.284 0L2.06 3.178a.2.2 0 0 1 0-.29l.846-.83a.203.203 0 0 1 .284 0z"
                />
                <path
                    d="m8 12.352 4.809-4.722a.203.203 0 0 1 .285 0l.845.83c.081.08.081.21 0 .29l-5.797 5.692a.203.203 0 0 1-.284 0L2.06 8.749a.2.2 0 0 1 0-.289l.846-.83a.203.203 0 0 1 .284 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDoubleDown16 extends KbqSvgIcon {}
