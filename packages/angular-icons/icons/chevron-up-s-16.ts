import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-up-s-16,[kbqChevronUpS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 7.148 4.191 10.87a.203.203 0 0 1-.284 0l-.846-.83a.2.2 0 0 1 0-.29l4.797-4.692a.203.203 0 0 1 .284 0l4.797 4.693c.081.079.081.21 0 .289l-.845.83a.203.203 0 0 1-.285 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronUpS16 extends KbqSvgIcon {}
