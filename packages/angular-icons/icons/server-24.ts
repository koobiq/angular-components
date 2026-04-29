import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-server-24,[kbqServer24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.3 15a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 3.3 9h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3zM3.3 22.5a1.8 1.8 0 0 1-1.8-1.8v-2.4a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3zM3.3 7.5a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3V3.9a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqServer24 extends KbqSvgIcon {}
