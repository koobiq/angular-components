import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBsd16]',
    template: `
        <svg:g>
            <svg:path
                d="M9.927 3.388s4.168-3.03 4.948-2.264c.779.765-2.327 4.965-2.327 4.965-2.374-.805-2.621-2.701-2.621-2.701M2.18 1.075c-.627.417.14 2.445.14 2.445s.675-1.472 2.197-1.388c0 0-1.71-1.475-2.337-1.057"
            />
            <svg:path
                d="m9.226 2.414-.581.422.03.251c.024.212.049.425.093.634q.028.133.09.338c.086.27.23.626.47 1.013.493.79 1.363 1.655 2.834 2.154l.83.281.52-.704.004-.005.008-.01.028-.04.203-.282a6.533 6.533 0 1 1-4.27-4.237l-.069.049-.14.1-.04.028z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqBsd16 extends KbqSvgIcon {}
