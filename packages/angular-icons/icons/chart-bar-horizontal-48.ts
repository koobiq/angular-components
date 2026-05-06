import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartBarHorizontal48]',
    template: `
        <svg:path d="M32 8v27h-3V8zm-14 6v21h-3V14zm-7 21v-9H8v9zm28 0v-6h-3v6zm-14 0V20h-3v15zm19 7v-3H4v3z" />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 48 48',
        width: '48',
        height: '48'
    }
})
export class KbqChartBarHorizontal48 extends KbqSvgIcon {}
