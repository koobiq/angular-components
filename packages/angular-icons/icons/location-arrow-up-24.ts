import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLocationArrowUp24]',
    template: `
        <svg:path
            d="M19.146 16.486q.044.016.09.01a.306.306 0 0 0 .216-.465l-7.19-11.387a.312.312 0 0 0-.525 0l-7.19 11.387a.306.306 0 0 0 .218.466c.03.004.06-.002.09-.01L12 14.25z"
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
export class KbqLocationArrowUp24 extends KbqSvgIcon {}
