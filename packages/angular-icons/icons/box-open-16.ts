import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBoxOpen16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.201 1a.2.2 0 0 0-.19.266L1.971 4H4.5l-.463-1.23a.2.2 0 0 1 .188-.27h1.58a.2.2 0 0 1 .188.13L6.51 4h3.034L8.492 1zM10.821 4h3.164l1.005-2.737A.2.2 0 0 0 14.799 1h-5.03zM1.923 5.2v9.6c0 .11.09.2.2.2h7.493V5.2H6.698v2.6a.2.2 0 0 1-.2.2H4.89a.2.2 0 0 1-.2-.2V5.2zM10.821 15h2.963a.2.2 0 0 0 .201-.2V5.2h-3.164z"
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
export class KbqBoxOpen16 extends KbqSvgIcon {}
