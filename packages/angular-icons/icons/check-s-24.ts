import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheckS24]',
    template: `
        <svg:path
            d="M20.605 8.092a.2.2 0 0 0 0-.283l-1.414-1.415a.2.2 0 0 0-.283 0L10.5 14.803l-4.612-4.612a.2.2 0 0 0-.283 0l-1.414 1.415a.2.2 0 0 0 0 .283l6.167 6.167a.2.2 0 0 0 .283 0z"
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
export class KbqCheckS24 extends KbqSvgIcon {}
