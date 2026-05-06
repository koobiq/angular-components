import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLocationArrowRight24]',
    template: `
        <svg:path
            d="M7.514 4.854a.2.2 0 0 1-.01-.09.306.306 0 0 1 .465-.216l11.387 7.19a.312.312 0 0 1 0 .525l-11.387 7.19a.306.306 0 0 1-.466-.218.2.2 0 0 1 .01-.09L9.75 12z"
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
export class KbqLocationArrowRight24 extends KbqSvgIcon {}
