import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-expand-24,[kbqChevronsExpand24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M4.2 3.9a.3.3 0 0 0-.3.3v5.175H1.5V3.3a1.8 1.8 0 0 1 1.8-1.8h5.775a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM9.375 20.4a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 1-.3-.3v-4.875a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3V20.7a1.8 1.8 0 0 0 1.8 1.8h5.775a.3.3 0 0 0 .3-.3zM14.625 22.2a.3.3 0 0 0 .3.3H20.7a1.8 1.8 0 0 0 1.8-1.8v-5.775a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3V19.8a.3.3 0 0 1-.3.3h-4.875a.3.3 0 0 0-.3.3zM14.925 3.9a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3H20.7a1.8 1.8 0 0 1 1.8 1.8v5.775a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V4.2a.3.3 0 0 0-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsExpand24 extends KbqSvgIcon {}
