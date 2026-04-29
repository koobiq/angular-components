import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-api-24,[kbqApi24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M6.754 6H4.318L0 18h2.788l.741-2.39h4.028L8.3 18h2.788zm.157 7.533H4.173L5.54 9.122zM16.164 13.83h-1.987V18h-2.612V6h4.599q1.395 0 2.387.52 1.002.518 1.53 1.425.537.899.537 2.06t-.537 2.02q-.528.856-1.53 1.335-.993.47-2.387.47m-1.987-5.745v3.66h1.987q.649 0 1.041-.223.4-.223.585-.61a2 2 0 0 0 .192-.89q0-.51-.192-.948a1.6 1.6 0 0 0-.585-.717q-.392-.272-1.041-.272zM24 18V6h-2.604v12z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqApi24 extends KbqSvgIcon {}
