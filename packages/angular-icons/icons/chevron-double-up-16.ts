import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleUp16]',
    template: `
        <svg:g>
            <svg:path
                d="m8 9.22-4.809 4.722a.203.203 0 0 1-.284 0l-.846-.83a.2.2 0 0 1 0-.29L7.858 7.13a.203.203 0 0 1 .284 0l5.797 5.692c.081.08.081.21 0 .29l-.845.83a.203.203 0 0 1-.285 0z"
            />
            <svg:path
                d="M8 3.648 3.191 8.37a.203.203 0 0 1-.284 0l-.846-.83a.2.2 0 0 1 0-.29l5.797-5.692a.203.203 0 0 1 .284 0l5.797 5.693c.081.079.081.21 0 .289l-.845.83a.203.203 0 0 1-.285 0z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqChevronDoubleUp16 extends KbqSvgIcon {}
