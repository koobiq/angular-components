import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-break-block-24,[kbqBreakBlock24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 9.417a.3.3 0 0 1 .459-.255l4.22 2.638a.3.3 0 0 1 0 .51l-4.22 2.637a.3.3 0 0 1-.459-.254zM6.606 0a.3.3 0 0 1 .3.3v6.615c0 .331.27.6.602.6h11.984a.6.6 0 0 0 .602-.6V.3a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3v6.615c0 1.657-1.347 3-3.008 3H7.508a3.004 3.004 0 0 1-3.008-3V.3a.3.3 0 0 1 .3-.3zM20.394 24a.3.3 0 0 1-.3-.3v-6.602a.6.6 0 0 0-.602-.6H7.508a.6.6 0 0 0-.602.6V23.7a.3.3 0 0 1-.3.3H4.8a.3.3 0 0 1-.3-.3v-6.602c0-1.657 1.347-3 3.008-3h11.984a3.004 3.004 0 0 1 3.008 3V23.7a.3.3 0 0 1-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBreakBlock24 extends KbqSvgIcon {}
