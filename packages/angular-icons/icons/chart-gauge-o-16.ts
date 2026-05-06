import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartGaugeO16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.595 9.089c0-3.023 2.42-5.474 5.405-5.474.637 0 1.247.111 1.815.316l1.217-1.233A6.9 6.9 0 0 0 8 2C4.134 2 1 5.174 1 9.089c0 1.875.72 3.582 1.894 4.85a.195.195 0 0 0 .282.002l.848-.853a.21.21 0 0 0 .004-.287A5.5 5.5 0 0 1 2.595 9.09M14.384 6.177l-1.233 1.249c.165.524.254 1.083.254 1.663a5.5 5.5 0 0 1-1.433 3.712.21.21 0 0 0 .004.287l.848.853a.195.195 0 0 0 .282-.003A7.12 7.12 0 0 0 15 9.088a7.1 7.1 0 0 0-.616-2.91"
            />
            <svg:path
                d="M9.87 9.201A1.88 1.88 0 0 1 8 11.094a1.88 1.88 0 0 1-1.87-1.893c0-1.045.838-1.892 1.87-1.892q.334.002.633.11l3.572-3.615a.2.2 0 0 1 .284 0l.845.856a.2.2 0 0 1 0 .284L9.76 8.562c.07.2.11.415.11.64"
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
export class KbqChartGaugeO16 extends KbqSvgIcon {}
