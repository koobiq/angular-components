import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextUnderline24]',
    template: `
        <svg:g>
            <svg:path
                d="M16.35 2.25a.3.3 0 0 0-.3.3v10.14q0 1.494-.497 2.462-.496.953-1.407 1.408-.897.456-2.14.456-1.241 0-2.152-.456-.91-.455-1.407-1.408-.498-.968-.497-2.462V2.55a.3.3 0 0 0-.3-.3H4.8a.3.3 0 0 0-.3.3v10.14q0 2.362.966 3.955a6.23 6.23 0 0 0 2.677 2.405q1.698.797 3.864.797 2.097 0 3.795-.797a6.3 6.3 0 0 0 2.704-2.405q.994-1.593.994-3.955V2.55a.3.3 0 0 0-.3-.3zM3.3 21.6a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h17.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3z"
            />
        </svg:g>
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
export class KbqTextUnderline24 extends KbqSvgIcon {}
