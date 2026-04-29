import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-star-24,[kbqStar24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M11.712 2.44a.314.314 0 0 1 .577 0l2.764 6.469 7.157.559c.28.021.393.371.177.551l-5.447 4.542 1.666 6.801a.313.313 0 0 1-.465.343L12 18.054l-6.141 3.65a.313.313 0 0 1-.465-.342l1.666-6.801-5.447-4.542a.312.312 0 0 1 .177-.551l7.157-.559z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqStar24 extends KbqSvgIcon {}
