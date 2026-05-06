import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightFromBracket24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.31 22.5h6.94a.3.3 0 0 0 .302-.3v-1.8a.3.3 0 0 0-.301-.3H4.216a.3.3 0 0 1-.302-.3V4.2a.3.3 0 0 1 .302-.3h6.035a.3.3 0 0 0 .301-.3V1.8a.3.3 0 0 0-.301-.3H3.31c-1 0-1.811.806-1.811 1.8v17.4c0 .994.81 1.8 1.81 1.8"
            />
            <svg:path
                d="m18.06 10.8-3.714-3.741a.3.3 0 0 1 0-.422l1.26-1.27a.303.303 0 0 1 .43 0l6.377 6.422a.3.3 0 0 1 0 .421l-6.377 6.422a.303.303 0 0 1-.43 0l-1.26-1.27a.3.3 0 0 1 0-.422l3.714-3.74H7.535a.3.3 0 0 1-.302-.3v-1.8a.3.3 0 0 1 .302-.3z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqArrowRightFromBracket24 extends KbqSvgIcon {}
