import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-badge-key-o-24,[kbqCloudBadgeKeyO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m16.838 8.88.542 1.62 1.105.011a6.5 6.5 0 0 1 .857.022 6.3 6.3 0 0 1 4.652 2.78 4.941 4.941 0 0 0-4.88-5.195 7.503 7.503 0 0 0-13.838-.945 5.414 5.414 0 0 0-.776 10.75V15.46a3.015 3.015 0 0 1 .836-5.886l1.448-.037.643-1.297a5.103 5.103 0 0 1 9.411.64"
                />
                <path
                    d="M6.3 15.899a.3.3 0 0 1 .3-.3h8.599a3.751 3.751 0 0 1 7.301 1.207 3.75 3.75 0 0 1-7.306 1.192H12.9v3.003a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3v-3.003H8.7v3.003a.3.3 0 0 1-.3.3H6.6a.3.3 0 0 1-.3-.3zm11.1.907a1.35 1.35 0 1 0 2.7 0 1.35 1.35 0 0 0-2.7 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudBadgeKeyO24 extends KbqSvgIcon {}
