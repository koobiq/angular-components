import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleXmarkS16]',
    template: `
        <svg:path
            fill-rule="evenodd"
            d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12m-.849-6L5.29 9.863a.2.2 0 0 0 0 .283l.565.566a.2.2 0 0 0 .283 0L8 8.849l1.863 1.863a.2.2 0 0 0 .283 0l.565-.566a.2.2 0 0 0 0-.283L8.848 8l1.863-1.862a.2.2 0 0 0 0-.283l-.565-.566a.2.2 0 0 0-.283 0L8 7.152 6.137 5.289a.2.2 0 0 0-.283 0l-.565.566a.2.2 0 0 0 0 .283z"
            clip-rule="evenodd"
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
export class KbqCircleXmarkS16 extends KbqSvgIcon {}
