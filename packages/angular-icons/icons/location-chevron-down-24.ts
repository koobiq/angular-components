import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-location-chevron-down-24,[kbqLocationChevronDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.854 7.514a.2.2 0 0 0-.09-.01.306.306 0 0 0-.216.465l7.19 11.387a.312.312 0 0 0 .525 0l7.19-11.387a.306.306 0 0 0-.218-.466.2.2 0 0 0-.09.01L12 9.75z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLocationChevronDown24 extends KbqSvgIcon {}
