import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-magnifying-glass-16,[kbqMagnifyingGlass16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.666 6.757a3.905 3.905 0 1 0-7.81 0 3.905 3.905 0 0 0 7.81 0m-.619 4.42a5.507 5.507 0 1 1 1.133-1.133l3.515 3.515a.2.2 0 0 1 0 .283l-.85.85a.2.2 0 0 1-.283 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMagnifyingGlass16 extends KbqSvgIcon {}
