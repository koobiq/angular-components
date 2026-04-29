import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-location-arrow-up-24,[kbqLocationArrowUp24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M19.146 16.486q.044.016.09.01a.306.306 0 0 0 .216-.465l-7.19-11.387a.312.312 0 0 0-.525 0l-7.19 11.387a.306.306 0 0 0 .218.466c.03.004.06-.002.09-.01L12 14.25z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLocationArrowUp24 extends KbqSvgIcon {}
