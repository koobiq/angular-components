import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGripVerticalS24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.5 4.5v3h3v-3zM7.5 10.5v3h3v-3zM7.5 16.5v3h3v-3zM13.5 16.5v3h3v-3zM13.5 13.5v-3h3v3zM13.5 7.5v-3h3v3z"
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
export class KbqGripVerticalS24 extends KbqSvgIcon {}
