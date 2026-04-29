import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-half-16,[kbqCloudHalf16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 3a5 5 0 0 1 4.742 3.412A3.294 3.294 0 0 1 12.706 13H3.61q-.093 0-.185-.005a3.61 3.61 0 0 1 .094-7.213A5 5 0 0 1 8 3m0 8.4h4.706a1.695 1.695 0 0 0 .02-3.388l-1.14-.013-.36-1.08A3.4 3.4 0 0 0 8 4.6z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudHalf16 extends KbqSvgIcon {}
