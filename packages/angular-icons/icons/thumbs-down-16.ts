import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-thumbs-down-16,[kbqThumbsDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M6.91 14.973c.08.046.18.032.243-.036.622-.669 3.809-4.099 4.61-5.043V2H4.439c-.462 0-.881.256-1.077.665C2.598 4.264 1.442 6.859 1.1 7.63A1.15 1.15 0 0 0 1 8.098v1.27c0 .654.542 1.184 1.21 1.184h4.44l-.258.996v.002q-.235.908-.473 1.814c-.132.503.081 1.038.526 1.322q.23.147.466.287M13.79 9.9c.668 0 1.21-.53 1.21-1.184V3.184C15 2.53 14.458 2 13.79 2h-.816v7.9z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqThumbsDown16 extends KbqSvgIcon {}
