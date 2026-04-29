import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-eject-24,[kbqEject24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 16.8 11.754 3.135a.3.3 0 0 1 .492 0L22.5 16.8zM22.5 20.7a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-2.1h21z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEject24 extends KbqSvgIcon {}
