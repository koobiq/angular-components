import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-briefcase-24,[kbqBriefcase24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M6 4.5a3 3 0 0 1 3-3h6.062a3 3 0 0 1 3 3V6H20.7a1.8 1.8 0 0 1 1.8 1.8v2.417A1.8 1.8 0 0 1 20.7 12H3.3a1.796 1.796 0 0 1-1.8-1.8V7.8A1.8 1.8 0 0 1 3.3 6H6zm9.662 0a.6.6 0 0 0-.6-.6H9a.6.6 0 0 0-.6.6V6h7.262zM3.3 13.8c-.656 0-1.27-.175-1.8-.482V19.2A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8v-5.882a3.6 3.6 0 0 1-1.8.482h-7.2v2.4a.3.3 0 0 1-.3.3h-2.4a.3.3 0 0 1-.3-.3v-2.4z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBriefcase24 extends KbqSvgIcon {}
