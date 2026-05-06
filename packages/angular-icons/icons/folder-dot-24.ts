import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderDot24]',
    template: `
        <svg:circle cx="21" cy="6" r="3" fill="currentColor" />
        <svg:g>
            <svg:path
                d="M16.439 7.5H1.5v11.7A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8v-8.64a4.802 4.802 0 0 1-6.061-3.06M1.5 4.8A1.8 1.8 0 0 1 3.3 3h4.2l2.7 2.7H1.5z"
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
export class KbqFolderDot24 extends KbqSvgIcon {}
