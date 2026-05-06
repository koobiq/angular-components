import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBellSlash16]',
    template: `
        <svg:g>
            <svg:path
                d="M14.237 15.359a.2.2 0 0 0 .283 0l.838-.84a.2.2 0 0 0 0-.282l-2.093-2.094h.978a.2.2 0 0 0 .2-.2v-.457a.2.2 0 0 0-.076-.157l-2.053-1.608v.001-3.725a4.33 4.33 0 0 0-3.21-4.187A1.1 1.1 0 0 0 8 .565 1.107 1.107 0 0 0 6.897 1.81a4.32 4.32 0 0 0-2.36 1.605L1.763.641a.2.2 0 0 0-.283 0l-.839.84a.2.2 0 0 0 0 .282zM3.686 9.72V6.49l5.653 5.653H1.756a.2.2 0 0 1-.2-.2l.002-.46a.2.2 0 0 1 .076-.158zM9.997 13.338c0 1.158-.89 2.097-1.99 2.097-1.099 0-1.99-.94-1.99-2.097z"
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
export class KbqBellSlash16 extends KbqSvgIcon {}
