import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUser16]',
    template: `
        <svg:path
            d="M8 8.5c-1.657 0-3-2.067-3-4S6.343 1 8 1s3 1.567 3 3.5-1.343 4-3 4m0 1.2c1.275 0 2.298-.741 2.976-1.614l3.282 1.969a1.2 1.2 0 0 1 .554 1.29l-.777 3.498a.2.2 0 0 1-.196.157H2.16a.2.2 0 0 1-.195-.157l-.777-3.499a1.2 1.2 0 0 1 .554-1.289l3.282-1.97C5.702 8.96 6.725 9.7 8 9.7"
        />
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
export class KbqUser16 extends KbqSvgIcon {}
