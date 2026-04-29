import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-line-multiple-48,[kbqChartLineMultiple48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path
                d="M45 39.002v3H3v-33h3v15.56l7.997-3.427 9.167-10.695a1 1 0 0 1 1.4-.118l8.48 7.067a.5.5 0 0 0 .517.075l9.289-3.98 1.3 3.033-11.148 4.777a.5.5 0 0 1-.517-.075l-7.912-6.594a.5.5 0 0 0-.7.059l-7.87 9.181L6 28.152v8.514l8.117-8.117a1 1 0 0 1 1.024-.241l8.383 2.794a.5.5 0 0 0 .436-.058l8.418-5.612a1 1 0 0 1 .948-.087l10.824 4.638-1.3 3.034-9.43-4.042a.5.5 0 0 0-.474.044l-8.295 5.53a1 1 0 0 1-.871.117l-8.041-2.68a.5.5 0 0 0-.512.12l-6.896 6.896z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartLineMultiple48 extends KbqSvgIcon {}
