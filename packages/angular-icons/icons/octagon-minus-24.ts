import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqOctagonMinus24]',
    template: `
        <svg:path
            d="M17.024 1.587a.3.3 0 0 0-.212-.087l-9.683.024a.3.3 0 0 0-.211.088l-5.33 5.364a.3.3 0 0 0-.088.212l.024 9.682a.3.3 0 0 0 .089.212l5.363 5.33a.3.3 0 0 0 .212.087l9.683-.023a.3.3 0 0 0 .212-.089l5.33-5.363a.3.3 0 0 0 .087-.213l-.024-9.682a.3.3 0 0 0-.088-.212zM17.7 13.5H6.3a.3.3 0 0 1-.3-.3v-2.4a.3.3 0 0 1 .3-.3h11.4a.3.3 0 0 1 .3.3v2.4a.3.3 0 0 1-.3.3"
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
export class KbqOctagonMinus24 extends KbqSvgIcon {}
