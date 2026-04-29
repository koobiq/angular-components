import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-star-o-24,[kbqStarO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.417 11.189 12 7.873l-1.417 3.316-3.493.272 2.658 2.216-.839 3.422L12 15.262l3.09 1.837-.838-3.422 2.658-2.216zm8.793-1.721c.28.021.393.371.177.551l-5.447 4.542 1.666 6.801a.313.313 0 0 1-.465.343L12 18.054l-6.141 3.65a.313.313 0 0 1-.465-.342l1.666-6.801-5.447-4.542a.312.312 0 0 1 .177-.551l7.157-.559 2.765-6.469a.314.314 0 0 1 .577 0l2.764 6.469z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqStarO24 extends KbqSvgIcon {}
