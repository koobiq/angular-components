import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-24,[kbqFolder24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v.9h8.7L7.5 3zM1.5 7.5v11.7A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8V9.3a1.8 1.8 0 0 0-1.8-1.8z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolder24 extends KbqSvgIcon {}
