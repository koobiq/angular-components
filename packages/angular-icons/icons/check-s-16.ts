import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheckS16]',
    template: `
        <svg:path
            d="M13.69 5.441a.2.2 0 0 0 0-.282l-.849-.849a.2.2 0 0 0-.282 0L7 9.87 3.973 6.84a.2.2 0 0 0-.283 0l-.849.849a.2.2 0 0 0 0 .283L6.86 11.99a.2.2 0 0 0 .282 0z"
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
export class KbqCheckS16 extends KbqSvgIcon {}
