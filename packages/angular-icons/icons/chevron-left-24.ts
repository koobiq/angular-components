import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronLeft24]',
    template: `
        <svg:path
            d="m10.005 12 7.157 7.214a.3.3 0 0 1 0 .426l-1.259 1.269a.31.31 0 0 1-.438 0l-8.627-8.696a.3.3 0 0 1 0-.426l8.627-8.696a.31.31 0 0 1 .438 0l1.259 1.269a.3.3 0 0 1 0 .427z"
        />
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
export class KbqChevronLeft24 extends KbqSvgIcon {}
