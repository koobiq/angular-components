import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-location-chevron-left-24,[kbqLocationChevronLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.486 4.854a.2.2 0 0 0 .01-.09.306.306 0 0 0-.465-.216l-11.387 7.19a.312.312 0 0 0 0 .525l11.387 7.19a.306.306 0 0 0 .466-.218.2.2 0 0 0-.01-.09L14.25 12z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLocationChevronLeft24 extends KbqSvgIcon {}
