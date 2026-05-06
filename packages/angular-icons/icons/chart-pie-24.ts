import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartPie24]',
    template: `
        <svg:g>
            <svg:path
                d="M19.96 18.842a10.48 10.48 0 0 0 2.54-6.857c0-2.62-.957-5.015-2.54-6.856l-6.847 6.856zM18.847 4.014a10.45 10.45 0 0 0-6.06-2.514v8.582z"
            />
            <svg:path
                d="M11.213 1.5C5.78 1.903 1.5 6.444 1.5 11.985 1.5 17.793 6.201 22.5 12 22.5a10.45 10.45 0 0 0 6.847-2.543l-7.634-7.646z"
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
export class KbqChartPie24 extends KbqSvgIcon {}
