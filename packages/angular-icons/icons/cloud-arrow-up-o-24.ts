import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-arrow-up-o-24,[kbqCloudArrowUpO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m17.38 9-.542-1.62a5.103 5.103 0 0 0-9.411-.64l-.643 1.296-1.448.037a3.014 3.014 0 0 0 .078 6.027h1.819l-2.374 2.372a5.415 5.415 0 0 1 .417-10.799 7.503 7.503 0 0 1 13.838.945 4.941 4.941 0 0 1 .057 9.88l-.613-.613-.078-.081-1.704-1.704h2.283a2.541 2.541 0 0 0 .029-5.082z"
                />
                <path
                    d="m13.206 16.47 2.305 2.304a.3.3 0 0 0 .424 0l1.273-1.273a.3.3 0 0 0 0-.424l-4.99-4.99a.3.3 0 0 0-.424 0l-4.99 4.99a.3.3 0 0 0 0 .424l1.273 1.273a.3.3 0 0 0 .424 0l2.305-2.305v7.244a.3.3 0 0 0 .213.287h1.974a.3.3 0 0 0 .213-.287z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudArrowUpO24 extends KbqSvgIcon {}
