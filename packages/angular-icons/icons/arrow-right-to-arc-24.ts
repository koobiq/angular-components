import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-arc-24,[kbqArrowRightToArc24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M22.5 12.004c0 5.7-4.54 10.34-10.2 10.5a.294.294 0 0 1-.3-.296v-1.8c0-.166.135-.3.3-.306a8.1 8.1 0 0 0 7.8-8.098 8.1 8.1 0 0 0-7.8-8.098.31.31 0 0 1-.3-.305V1.8c0-.166.135-.3.3-.296 5.66.16 10.2 4.8 10.2 10.5"
                />
                <path
                    d="m12.264 13.204-3.693 3.742a.3.3 0 0 0 0 .422l1.254 1.27a.3.3 0 0 0 .427 0l6.34-6.424a.3.3 0 0 0 0-.421l-6.34-6.424a.3.3 0 0 0-.427 0l-1.254 1.27a.3.3 0 0 0 0 .422l3.693 3.742H1.8a.3.3 0 0 0-.3.3v1.801a.3.3 0 0 0 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToArc24 extends KbqSvgIcon {}
