import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleXmarkS24]',
    template: `
        <svg:path
            fill-rule="evenodd"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m-1.273-9-2.794 2.795a.3.3 0 0 0 0 .424l.848.849a.3.3 0 0 0 .425 0L12 13.273l2.794 2.795a.3.3 0 0 0 .425 0l.848-.849a.3.3 0 0 0 0-.424l-2.794-2.794 2.794-2.795a.3.3 0 0 0 0-.424l-.848-.848a.3.3 0 0 0-.425 0L12 10.728 9.206 7.934a.3.3 0 0 0-.425 0l-.848.848a.3.3 0 0 0 0 .424z"
            clip-rule="evenodd"
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
export class KbqCircleXmarkS24 extends KbqSvgIcon {}
