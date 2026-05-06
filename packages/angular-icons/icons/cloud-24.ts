import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloud24]',
    template: `
        <svg:path
            d="M12.093 19.5H5.414a5.414 5.414 0 0 1-.138-10.827 7.503 7.503 0 0 1 13.838.945 4.941 4.941 0 0 1-.055 9.882z"
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
export class KbqCloud24 extends KbqSvgIcon {}
