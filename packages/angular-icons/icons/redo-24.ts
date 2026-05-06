import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRedo24]',
    template: `
        <svg:path
            d="M17.906 11.049 13.954 15l1.697 1.697L22.5 9.85 15.65 3l-1.697 1.697 3.952 3.952H7.95C4.388 8.649 1.5 11.438 1.5 15s2.888 6 6.45 6H12v-2.4H7.95c-2.237 0-4.05-1.363-4.05-3.6s1.813-3.951 4.05-3.951z"
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
export class KbqRedo24 extends KbqSvgIcon {}
