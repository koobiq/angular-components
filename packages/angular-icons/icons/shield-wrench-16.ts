import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldWrench16]',
    template: `
        <svg:path
            d="M2.2 1A1.2 1.2 0 0 0 1 2.202v9.383a.2.2 0 0 0 .115.181l6.8 4.215a.2.2 0 0 0 .17 0l6.8-4.214a.2.2 0 0 0 .115-.182V2.202A1.2 1.2 0 0 0 13.8 1zm8.268 3.135L9.201 5.4a.2.2 0 0 0-.055.18l.144.721a.2.2 0 0 0 .157.157l.723.144a.2.2 0 0 0 .18-.054l1.27-1.266a.1.1 0 0 1 .169.056l.197 1.377a.2.2 0 0 1-.057.17l-1.192 1.19a.2.2 0 0 1-.187.054l-1.71-.394-2.715 3.564a1.185 1.185 0 0 1-1.778.12 1.18 1.18 0 0 1 .12-1.775L8.021 6.95l-.404-1.748a.2.2 0 0 1 .053-.187l1.193-1.19a.2.2 0 0 1 .169-.056l1.38.197a.1.1 0 0 1 .056.17"
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
export class KbqShieldWrench16 extends KbqSvgIcon {}
