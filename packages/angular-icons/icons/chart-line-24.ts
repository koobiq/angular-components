import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.6 1.5a.3.3 0 0 1 .3.3v18.311h18.317a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.5V1.8a.3.3 0 0 1 .3-.3z"
            />
            <svg:path
                d="M5.7 18.305h1.692l5.358-5.358 2.788 2.788a.3.3 0 0 0 .424 0l6.424-6.424a.3.3 0 0 0 0-.425l-1.272-1.272a.3.3 0 0 0-.425 0l-4.939 4.939-2.788-2.788a.3.3 0 0 0-.424 0L5.7 16.603z"
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
export class KbqChartLine24 extends KbqSvgIcon {}
