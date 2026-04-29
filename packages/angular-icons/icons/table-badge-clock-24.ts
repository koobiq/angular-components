import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-table-badge-clock-24,[kbqTableBadgeClock24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M12.067 21a7 7 0 0 1-.367-2.25c0-1.461.445-2.818 1.206-3.944v-.556a.3.3 0 0 1 .3-.3h.38a7.06 7.06 0 0 1 2.68-1.8h-3.06a.3.3 0 0 1-.3-.3V7.807a.3.3 0 0 1 .3-.3H21.3a.3.3 0 0 1 .3.3v4.043a.3.3 0 0 1-.3.3h-.066A7.06 7.06 0 0 1 24 14.045V4.893C23.977 3.843 23.18 3 22.2 3H1.8C.82 3 .022 3.844 0 4.893v14.169C0 20.132.806 21 1.8 21zM2.7 7.507h8.094a.3.3 0 0 1 .3.3v4.043a.3.3 0 0 1-.3.3H2.7a.3.3 0 0 1-.3-.3V7.807a.3.3 0 0 1 .3-.3m0 6.443h8.094a.3.3 0 0 1 .3.3v4.05a.3.3 0 0 1-.3.3H2.7a.3.3 0 0 1-.3-.3v-4.05a.3.3 0 0 1 .3-.3"
                />
                <path
                    d="M19.65 19.35a.3.3 0 0 1-.3.3h-2.1a.3.3 0 0 1-.3-.3v-.9a.3.3 0 0 1 .3-.3h.9V16.2a.3.3 0 0 1 .3-.3h.9a.3.3 0 0 1 .3.3z"
                />
                <path
                    d="M24 18.75a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0m-1.575 0a3.675 3.675 0 1 0-7.35 0 3.675 3.675 0 0 0 7.35 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTableBadgeClock24 extends KbqSvgIcon {}
