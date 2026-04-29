import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bucket-s3-24,[kbqBucketS324]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M12 1.5c4.97 0 9 1.679 9 3.75v.018c-.02 2.064-4.042 3.735-9 3.735s-8.98-1.67-9-3.735V5.25C3 3.179 7.03 1.5 12 1.5"
                />
                <path
                    d="M3 8.476c.577.44 1.25.802 1.958 1.096 1.895.787 4.385 1.23 7.042 1.23s5.147-.444 7.042-1.23c.708-.294 1.381-.656 1.958-1.096l-1.503 10.99c-.117 1.664-3.357 3.002-7.363 3.03L12 22.5q-.246 0-.476-.009c-3.76-.098-6.767-1.35-7.008-2.916zm7.8 4.124a.3.3 0 0 0-.3.3v2.4a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3v-2.4a.3.3 0 0 0-.3-.3zm-3 3.9a.3.3 0 0 0-.3.3v2.4a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3v-2.4a.3.3 0 0 0-.3-.3zm6 0a.3.3 0 0 0-.3.3v2.4a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3v-2.4a.3.3 0 0 0-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBucketS324 extends KbqSvgIcon {}
